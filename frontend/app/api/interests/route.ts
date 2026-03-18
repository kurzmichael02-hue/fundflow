import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

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
  const body = await req.json()
  const { project_id, investor_email, investor_name } = body
  if (!project_id) return NextResponse.json({ error: "project_id required" }, { status: 400 })

  const supabase = getClient()

  const { data: existing } = await supabase
    .from("interests")
    .select("id")
    .eq("project_id", project_id)
    .eq("investor_email", investor_email || "anonymous")
    .single()

  if (existing) return NextResponse.json({ message: "Already expressed interest" })

  const { data, error } = await supabase
    .from("interests")
    .insert({ project_id, investor_email: investor_email || "anonymous", investor_name: investor_name || "Investor" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get project + founder email
  try {
    const { data: project } = await supabase
      .from("projects")
      .select("name, user_id, profiles(email, name)")
      .eq("id", project_id)
      .single()

    const founderEmail = (project?.profiles as any)?.email
    const founderName = (project?.profiles as any)?.name || "Founder"
    const projectName = project?.name || "your project"

    if (founderEmail) {
      await resend.emails.send({
        from: "FundFlow <onboarding@resend.dev>",
        to: founderEmail,
        subject: `New investor interest in ${projectName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #04070f; color: #e2e8f0; border-radius: 16px;">
            <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #0ea5e9, #0284c7); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 24px;">FF</div>
            <h2 style="color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 8px;">New investor interest</h2>
            <p style="color: #64748b; font-size: 14px; margin: 0 0 24px;">Someone just expressed interest in <strong style="color: #fff;">${projectName}</strong>.</p>
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="margin: 0 0 4px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Investor</p>
              <p style="margin: 0; color: #fff; font-size: 15px; font-weight: 600;">${investor_name || "Anonymous"}</p>
              ${investor_email ? `<p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">${investor_email}</p>` : ""}
            </div>
            <a href="https://fundflow-omega.vercel.app/dashboard" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;">View on Dashboard</a>
            <p style="color: #334155; font-size: 12px; margin: 24px 0 0;">FundFlow · The investor CRM for Web3 founders</p>
          </div>
        `
      })
    }
  } catch (emailErr) {
    console.error("Email error:", emailErr)
  }

  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const token = auth.replace("Bearer ", "")
  const userId = getUserIdFromToken(token)
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const supabase = getClient()

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", userId)

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