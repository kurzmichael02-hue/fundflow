import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

// POST — investor expresses interest
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { project_id, investor_email, investor_name } = body

  if (!project_id) return NextResponse.json({ error: "project_id required" }, { status: 400 })

  const supabase = getClient()

  // Check if already expressed interest
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
  return NextResponse.json(data)
}

// GET — founder gets interests on their projects (auth required)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const token = auth.replace("Bearer ", "")
  const userId = getUserIdFromToken(token)
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const supabase = getClient()

  // Get founder's projects first
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