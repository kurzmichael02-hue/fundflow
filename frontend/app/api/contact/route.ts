import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { escapeHtml } from "@/lib/escapeHtml"
import { rateLimit } from "@/lib/ratelimit"

// Lazy client — see other API routes for the why (build-time module eval).
function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Lazily construct Resend on the first request. Building it at module load
// would fail during Next.js page-data collection whenever RESEND_API_KEY
// isn't injected (e.g. local builds without .env.local).
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

// Minimal RFC-ish email sanity check. We don't need RFC 5322 perfection, just
// a guard against obvious garbage and header injection (newlines in the subject).
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Keep fields tight — big message bodies also pump up spam risk.
const LIMITS = { name: 80, email: 120, category: 60, message: 4000 }

export async function POST(req: NextRequest) {
  // Public form — 5 submissions per IP per hour is plenty for a legit
  // sender and instantly cuts off spam bots hitting in bulk.
  const limited = await rateLimit(req, "contact", 5, "1 h")
  if (limited) return limited

  try {
    const body = await req.json()
    const first_name = String(body.first_name || "").trim()
    const last_name = String(body.last_name || "").trim()
    const email = String(body.email || "").trim()
    const category = String(body.category || "").trim()
    const message = String(body.message || "").trim()

    if (!first_name || !last_name || !email || !category || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
    if (!EMAIL_RX.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }
    if (
      first_name.length > LIMITS.name || last_name.length > LIMITS.name ||
      email.length > LIMITS.email || category.length > LIMITS.category ||
      message.length > LIMITS.message
    ) {
      return NextResponse.json({ error: "One or more fields exceed allowed length" }, { status: 400 })
    }

    // Save to Supabase
    const { error: dbError } = await getClient()
      .from("contacts")
      .insert({ first_name, last_name, email, category, message })

    if (dbError) throw new Error(dbError.message)

    // Escape everything before it lands in the HTML email body — otherwise a
    // contact form becomes a free HTML injection vector straight into our inbox.
    const safeFirst = escapeHtml(first_name)
    const safeLast = escapeHtml(last_name)
    const safeEmail = escapeHtml(email)
    const safeCategory = escapeHtml(category)
    const safeMessage = escapeHtml(message)
    // Strip newlines from the subject — that's how header injection happens.
    const safeSubject = `[${category}] New message from ${first_name} ${last_name}`.replace(/[\r\n]+/g, " ")

    await getResend().emails.send({
      from: "FundFlow Contact <onboarding@resend.dev>",
      to: "kurzmichael02@gmail.com",
      replyTo: email,
      subject: safeSubject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Name</td><td style="padding: 8px 0; font-size: 13px;">${safeFirst} ${safeLast}</td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email</td><td style="padding: 8px 0; font-size: 13px;"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #64748b; font-size: 13px;">Category</td><td style="padding: 8px 0; font-size: 13px;">${safeCategory}</td></tr>
          </table>
          <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">Message</p>
            <p style="font-size: 14px; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}