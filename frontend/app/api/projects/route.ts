import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireUser } from "@/lib/auth"
import { rateLimit } from "@/lib/ratelimit"

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

// Explicit allowlist of columns the public deal-room page actually
// renders. Same defensive pattern as /api/investor-directory: if the
// projects table grows internal columns later (admin notes, internal
// scoring, plan flags, …), `select("*")` would silently leak them.
// Listing the public surface means a schema addition stays invisible
// until somebody opts it in here on purpose.
const PUBLIC_COLUMNS = [
  "id", "user_id", "name", "description", "stage", "chain",
  "tags", "goal", "raised", "published", "created_at",
].join(", ")

// GET — public. Returns every published project for the investor deal flow.
// Rate-limited per IP because this is the most expensive public endpoint
// (joins profiles, no auth wall) — a curl loop could otherwise grind it.
// 60/h is generous: the deal-flow page on /investor/discover loads it once
// per visit, and a Realtime client wouldn't poll this endpoint.
export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "projects-public", 60, "1 h")
  if (limited) return limited

  const supabase = getClient()
  const { data, error } = await supabase
    .from("projects")
    .select(`${PUBLIC_COLUMNS}, profiles(name, company)`)
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

// POST — create or update the caller's own project.
export async function POST(req: NextRequest) {
  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard

  const body = await req.json()
  const payload = pickProjectFields(body)

  if (!payload.name || typeof payload.name !== "string" || !(payload.name as string).trim()) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 })
  }

  const supabase = getClient()

  const { data: existing } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("user_id", user.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PATCH — returns the caller's own project. Keeping the verb to avoid
// breaking the frontend; semantically it's a scoped GET.
export async function PATCH(req: NextRequest) {
  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard

  const supabase = getClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) return NextResponse.json(null)
  return NextResponse.json(data)
}
