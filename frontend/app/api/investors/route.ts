import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/auth"

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

// Fields a user may write on their own investor rows. Keeps a malicious
// client from setting `id`, `user_id` or `created_at` through the API.
const INVESTOR_WRITABLE_FIELDS = [
  "name", "company", "email", "status", "deal_size", "notes",
] as const

function pickInvestorFields(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const f of INVESTOR_WRITABLE_FIELDS) {
    if (f in body) out[f] = body[f]
  }
  return out
}

export async function GET(req: NextRequest) {
  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard

  const supabase = getClient()
  const { data, error } = await supabase
    .from("investors")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard

  const supabase = getClient()

  // Plan-gated cap: free plan tops out at 25 rows.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single()

  if (profile?.plan !== "pro") {
    const { count } = await supabase
      .from("investors")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if ((count ?? 0) >= 25) {
      return NextResponse.json(
        { error: "Free plan limit reached. Upgrade to Pro for unlimited investors.", limit: true },
        { status: 403 },
      )
    }
  }

  const body = await req.json()
  const payload = pickInvestorFields(body)

  if (!payload.name || typeof payload.name !== "string" || !(payload.name as string).trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("investors")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const body = await req.json()
  const payload = pickInvestorFields(body)

  const supabase = getClient()
  const { data, error } = await supabase
    .from("investors")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const supabase = getClient()
  const { error } = await supabase
    .from("investors")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: "Deleted" })
}
