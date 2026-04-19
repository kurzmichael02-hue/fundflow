import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import { escapeHtml } from "@/lib/escapeHtml"
import { requireUser } from "@/lib/auth"
import { rateLimit } from "@/lib/ratelimit"

let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY)
  return _resend
}

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME = 120
const MAX_EMAIL = 160

// POST — public. An investor (or anyone with a project link) taps "Express
// interest". Rate-limited, validated, dedup'd per email.
export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "interests", 20, "1 h")
  if (limited) return limited

  const body = await req.json()
  const project_id = String(body.project_id || "").trim()
  const investor_email_raw = String(body.investor_email || "").trim().toLowerCase()
  const investor_name_raw = String(body.investor_name || "").trim()

  if (!project_id) {
    return NextResponse.json({ error: "project_id required" }, { status: 400 })
  }

  // Only accept a real email or the literal "anonymous" sentinel — anything
  // else looks like fuzzing and we drop it.
  const investor_email =
    investor_email_raw === "" || investor_email_raw === "anonymous"
      ? "anonymous"
      : (EMAIL_RX.test(investor_email_raw) && investor_email_raw.length <= MAX_EMAIL
          ? investor_email_raw
          : null)
  if (investor_email === null) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }
  const investor_name = investor_name_raw.slice(0, MAX_NAME) || "Investor"

  const supabase = getClient()

  // Dedup per (project_id, investor_email). maybeSingle() doesn't throw on
  // zero rows the way .single() does, which was the bug in the old code —
  // zero or two-plus rows both returned an error and silently let a
  // duplicate insert through.
  //
  // For "anonymous" specifically we skip dedup: it's a catch-all sentinel and
  // different investors can legitimately use it, so deduping would suppress
  // real signals. Abuse here is capped by the rate limit above.
  if (investor_email !== "anonymous") {
    const { data: existing } = await supabase
      .from("interests")
      .select("id")
      .eq("project_id", project_id)
      .eq("investor_email", investor_email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ message: "Already expressed interest" })
    }
  }

  const { data, error } = await supabase
    .from("interests")
    .insert({ project_id, investor_email, investor_name })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Best-effort email notification. Wrapped in try/catch so a Resend hiccup
  // doesn't break a successful insert.
  try {
    const { data: project } = await supabase
      .from("projects")
      .select("name, user_id, profiles(email, name)")
      .eq("id", project_id)
      .single()

    const founderEmail = (project?.profiles as { email?: string | null } | null)?.email
    const projectName = project?.name || "your project"

    if (founderEmail) {
      const safeProjectName = escapeHtml(projectName)
      const safeInvestorName = escapeHtml(investor_name)
      const safeInvestorEmail = investor_email !== "anonymous" ? escapeHtml(investor_email) : ""
      const safeSubject = `New investor interest in ${projectName}`.replace(/[\r\n]+/g, " ")

      // Editorial email. Web-safe fonts (Georgia/Courier/Arial) because
      // every other email client refuses to load webfonts — and falling
      // back silently to Times New Roman looks worse than just owning it.
      await getResend().emails.send({
        from: "FundFlow <onboarding@resend.dev>",
        to: founderEmail,
        subject: safeSubject,
        html: `
          <div style="font-family: Arial, Helvetica, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #060608; color: #e5e7eb;">
            <div style="font-family: Courier, monospace; font-size: 10px; color: #475569; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px;">
              FundFlow · Inbound signal
            </div>
            <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 32px; line-height: 1.1; letter-spacing: -0.02em; color: #ffffff; font-weight: 500; margin: 0 0 20px;">
              New interest<br>
              <em style="font-weight: 400;">in ${safeProjectName}.</em>
            </h1>
            <p style="font-size: 15px; line-height: 1.6; color: #94a3b8; margin: 0 0 28px;">
              Someone tapped Express Interest on your project page. The details are below — reach out while it's warm.
            </p>
            <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; border-top: 1px solid rgba(255,255,255,0.08); border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 28px;">
              <tr>
                <td style="padding: 14px 0; width: 120px; vertical-align: top;">
                  <div style="font-family: Courier, monospace; font-size: 10px; color: #475569; letter-spacing: 0.12em; text-transform: uppercase;">Investor</div>
                </td>
                <td style="padding: 14px 0; font-size: 15px; color: #ffffff; font-weight: 500;">${safeInvestorName}</td>
              </tr>
              ${safeInvestorEmail ? `
              <tr style="border-top: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 14px 0; vertical-align: top;">
                  <div style="font-family: Courier, monospace; font-size: 10px; color: #475569; letter-spacing: 0.12em; text-transform: uppercase;">Email</div>
                </td>
                <td style="padding: 14px 0; font-family: Courier, monospace; font-size: 13px; color: #cbd5e1;">${safeInvestorEmail}</td>
              </tr>` : ""}
              <tr style="border-top: 1px solid rgba(255,255,255,0.06);">
                <td style="padding: 14px 0; vertical-align: top;">
                  <div style="font-family: Courier, monospace; font-size: 10px; color: #475569; letter-spacing: 0.12em; text-transform: uppercase;">Project</div>
                </td>
                <td style="padding: 14px 0; font-size: 15px; color: #ffffff;">${safeProjectName}</td>
              </tr>
            </table>
            <a href="https://fundflow-omega.vercel.app/dashboard" style="display: inline-block; background: #10b981; color: #ffffff; text-decoration: none; padding: 12px 20px; font-family: Courier, monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 600;">
              Open dashboard &rarr;
            </a>
            <p style="font-family: Courier, monospace; font-size: 10px; color: #475569; letter-spacing: 0.06em; margin: 40px 0 0; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06);">
              FundFlow · The investor CRM for Web3 founders
            </p>
          </div>
        `,
      })
    }
  } catch (emailErr) {
    console.error("Interest email error:", emailErr)
  }

  return NextResponse.json(data)
}

// GET — founder-only. Returns interests on the caller's projects.
export async function GET(req: NextRequest) {
  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard

  const supabase = getClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id)

  if (!projects?.length) return NextResponse.json([])

  const projectIds = projects.map(p => p.id)
  const { data, error } = await supabase
    .from("interests")
    .select("*, projects(name)")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
