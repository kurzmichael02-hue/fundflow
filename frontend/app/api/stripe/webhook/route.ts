import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient, PostgrestError } from "@supabase/supabase-js"

let _stripe: Stripe | null = null
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-02-25.clover",
    })
  }
  return _stripe
}

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

// Supabase returns 23505 on unique-constraint violations. We use that as the
// "seen this event already" signal from the idempotency table below.
const PG_UNIQUE_VIOLATION = "23505"

/**
 * Mark the event as seen. Returns true if this is the first time, false if
 * Stripe already delivered it. Requires a table created with:
 *
 *   CREATE TABLE IF NOT EXISTS stripe_webhook_events (
 *     id TEXT PRIMARY KEY,
 *     type TEXT NOT NULL,
 *     processed_at TIMESTAMPTZ DEFAULT now()
 *   );
 *
 * If the table doesn't exist (42P01), we fall back to "proceed anyway" so
 * the webhook never breaks on a fresh environment. Run the migration and
 * idempotency kicks in on the next deploy.
 */
async function markEventSeen(
  supabase: ReturnType<typeof getClient>,
  eventId: string,
  eventType: string,
): Promise<{ firstTime: boolean; skipped: boolean }> {
  const { error } = await supabase
    .from("stripe_webhook_events")
    .insert({ id: eventId, type: eventType })

  if (!error) return { firstTime: true, skipped: false }
  const err = error as PostgrestError
  if (err.code === PG_UNIQUE_VIOLATION) {
    return { firstTime: false, skipped: false }
  }
  // Missing table, permissions, or something else — log it and let the
  // event process anyway. Production should have the migration applied
  // so this path never fires there.
  console.warn("stripe_webhook_events insert failed, proceeding without idempotency:", err.code, err.message)
  return { firstTime: true, skipped: true }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature"
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 })
  }

  const supabase = getClient()

  // Idempotency — drop duplicates before any side effect runs. Stripe
  // retries events on transient failures, and we don't want a second
  // "checkout.session.completed" to overwrite the customer/subscription
  // pointers with stale values from the retry attempt.
  const seen = await markEventSeen(supabase, event.id, event.type)
  if (!seen.firstTime) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            plan: "pro",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", userId)
      }
      break
    }

    case "invoice.paid": {
      // Monthly renewal — keep plan active.
      const invoice = event.data.object as Stripe.Invoice
      const subId = (invoice as unknown as { subscription?: string }).subscription
      if (subId) {
        await supabase
          .from("profiles")
          .update({ plan: "pro" })
          .eq("stripe_subscription_id", subId)
      }
      break
    }

    case "invoice.payment_failed": {
      // Don't downgrade yet — Stripe will retry automatically and
      // customer.subscription.updated will fire if it actually goes bad.
      console.log("Payment failed for invoice:", (event.data.object as Stripe.Invoice).id)
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status
      if (status === "past_due" || status === "unpaid" || status === "canceled") {
        await supabase
          .from("profiles")
          .update({ plan: "free" })
          .eq("stripe_subscription_id", subscription.id)
      } else if (status === "active") {
        await supabase
          .from("profiles")
          .update({ plan: "pro" })
          .eq("stripe_subscription_id", subscription.id)
      }
      break
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from("profiles")
        .update({
          plan: "free",
          stripe_subscription_id: null,
        })
        .eq("stripe_subscription_id", subscription.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
