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

// GET — public, returns all published projects
export async function GET() {
  const supabase = getClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*, profiles(name, company)")
    .eq("published", true)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Fields a founder may write via this endpoint. Anything else (id, user_id,
// created_at) is either owned by the server or the DB — we never trust a
// client-supplied value for those.
const PROJECT_WRITABLE_FIELDS = [
  "name", "description", "stage", "chain",
  "goal", "raised", "tags", "published",
] as const

function pickProjectFields(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const field of PROJECT_WRITABLE_FIELDS) {
    if (field in body) out[field] = body[field]
  }
  return out
}

// POST — create or update project (founder only)
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const token = auth.replace("Bearer ", "")
  const userId = getUserIdFromToken(token)
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const body = await req.json()
  const payload = pickProjectFields(body)

  if (!payload.name || typeof payload.name !== "string" || !(payload.name as string).trim()) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 })
  }

  const supabase = getClient()

  // Check if project already exists for this user
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId)
    .single()

  if (existing) {
    // Update — user_id pinned via WHERE, not spread in from the body
    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("user_id", userId)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } else {
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...payload, user_id: userId })
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
}

// GET single project for current founder
export async function PATCH(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const token = auth.replace("Bearer ", "")
  const userId = getUserIdFromToken(token)
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const supabase = getClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error) return NextResponse.json(null)
  return NextResponse.json(data)
}