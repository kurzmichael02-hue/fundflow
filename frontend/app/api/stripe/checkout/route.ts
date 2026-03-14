import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
})

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

    const { email } = await req.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: "price_1TAbaFCSv3qbNjqJ5pFiTvNK",
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://fundflow-omega.vercel.app"}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://fundflow-omega.vercel.app"}/dashboard?cancelled=true`,
      customer_email: email,
      metadata: { userId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Stripe error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}