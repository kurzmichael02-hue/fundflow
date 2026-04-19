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

      await getResend().emails.send({
        from: "FundFlow <onboarding@resend.dev>",
        to: founderEmail,
        subject: safeSubject,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #04070f; color: #e2e8f0; border-radius: 16px;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 24px;">FF</div>
            <h2 style="color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 8px;">New investor interest</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 24px;">Someone just expressed interest in <strong style="color: #fff;">${safeProjectName}</strong>.</p>
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 4px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Investor</p>
              <p style="margin: 0; color: #fff; font-size: 15px; font-weight: 600;">${safeInvestorName}</p>
              ${safeInvestorEmail ? `<p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">${safeInvestorEmail}</p>` : ""}
            </div>
            <a href="https://fundflow-omega.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;">View on dashboard</a>
            <p style="color: #334155; font-size: 12px; margin: 24px 0 0;">FundFlow · The investor CRM for Web3 founders</p>
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
