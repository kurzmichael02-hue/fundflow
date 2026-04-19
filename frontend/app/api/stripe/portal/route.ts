import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

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
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    return decoded.sub || null
  } catch { return null }
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization")
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const token = auth.replace("Bearer ", "")
    const userId = getUserIdFromToken(token)
    if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const supabase = getClient()
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 })
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://fundflow-omega.vercel.app"}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Portal error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}