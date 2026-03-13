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

// POST — create or update project (founder only)
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization")
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const token = auth.replace("Bearer ", "")
  const userId = getUserIdFromToken(token)
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const body = await req.json()
  const supabase = getClient()

  // Check if project already exists for this user
  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", userId)
    .single()

  if (existing) {
    // Update
    const { data, error } = await supabase
      .from("projects")
      .update({ ...body, user_id: userId })
      .eq("user_id", userId)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } else {
    // Insert
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...body, user_id: userId })
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