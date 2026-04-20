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

    // Editorial template to match the rest of the product. Web-safe fonts
    // only (Georgia / Courier / Arial) since Resend-delivered emails get
    // rendered by every mail client under the sun.
    await getResend().emails.send({
      from: "FundFlow Contact <onboarding@resend.dev>",
      to: "kurzmichael02@gmail.com",
      replyTo: email,
      subject: safeSubject,
      html: `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #060608; color: #e5e7eb;">
          <div style="font-family: Courier, monospace; font-size: 10px; color: #64748b; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px;">
            FundFlow · Contact form
          </div>
          <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; line-height: 1.15; letter-spacing: -0.02em; color: #ffffff; font-weight: 500; margin: 0 0 8px;">
            New message<br>
            <em style="font-weight: 400;">from ${safeFirst} ${safeLast}.</em>
          </h1>
          <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); margin-top: 28px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 12px 0; width: 100px; font-family: Courier, monospace; font-size: 10px; color: #64748b; letter-spacing: 0.12em; text-transform: uppercase; vertical-align: top;">From</td>
              <td style="padding: 12px 0; font-family: Courier, monospace; font-size: 13px; color: #cbd5e1;">
                <a href="mailto:${safeEmail}" style="color: #10b981; text-decoration: none;">${safeEmail}</a>
              </td>
            </tr>
            <tr style="border-top: 1px solid rgba(255,255,255,0.06);">
              <td style="padding: 12px 0; font-family: Courier, monospace; font-size: 10px; color: #64748b; letter-spacing: 0.12em; text-transform: uppercase; vertical-align: top;">Category</td>
              <td style="padding: 12px 0; font-size: 14px; color: #e5e7eb;">${safeCategory}</td>
            </tr>
          </table>
          <div style="font-family: Courier, monospace; font-size: 10px; color: #64748b; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px;">Message</div>
          <p style="font-size: 15px; line-height: 1.65; color: #cbd5e1; margin: 0; white-space: pre-wrap;">${safeMessage}</p>
          <p style="font-family: Courier, monospace; font-size: 10px; color: #64748b; letter-spacing: 0.06em; margin: 40px 0 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);">
            Hit reply — the reply-to is set to the sender.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}