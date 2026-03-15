import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = getClient()

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
      // Monthly renewal — keep plan active
      const invoice = event.data.object as Stripe.Invoice
      const subId = (invoice as any).subscription as string
      if (subId) {
        await supabase
          .from("profiles")
          .update({ plan: "pro" })
          .eq("stripe_subscription_id", subId)
      }
      break
    }

    case "invoice.payment_failed": {
      // Payment failed — optionally notify, but don't downgrade yet
      // Stripe will retry automatically
      console.log("Payment failed for invoice:", (event.data.object as Stripe.Invoice).id)
      break
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status
      // If subscription is past_due or unpaid, downgrade to free
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