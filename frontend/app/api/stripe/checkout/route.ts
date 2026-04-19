import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import { requireUser } from "@/lib/auth"

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

const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID || "price_1TAbaFCSv3qbNjqJ5pFiTvNK"

export async function POST(req: NextRequest) {
  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard

  try {
    // Look up the current profile. Two things matter: (1) is the user already
    // on Pro? Then we don't start another checkout — we push them at the
    // billing portal instead. (2) Do they already have a stripe_customer_id?
    // Then reuse it so we don't create a duplicate Stripe customer every
    // time they click upgrade.
    const supabase = getClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, email, stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profile?.plan === "pro") {
      return NextResponse.json(
        { error: "Already subscribed. Open the billing portal to manage it." },
        { status: 400 },
      )
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fundflow-omega.vercel.app"

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      success_url: `${appUrl}/dashboard?upgraded=true`,
      cancel_url: `${appUrl}/dashboard?cancelled=true`,
      metadata: { userId: user.id },
      // The metadata ends up on both the session and the subscription so the
      // webhook can route the event back to the right profile row.
      subscription_data: { metadata: { userId: user.id } },
      allow_promotion_codes: true,
    }

    // Reuse the customer if we already minted one — otherwise pre-fill
    // their email so Stripe creates a clean one.
    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id
    } else if (profile?.email || user.email) {
      sessionParams.customer_email = profile?.email || user.email || undefined
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return NextResponse.json({ url: session.url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Checkout failed"
    console.error("Stripe checkout error:", err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
