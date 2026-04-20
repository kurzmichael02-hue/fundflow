import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireUser } from "@/lib/auth"

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

// GET /api/investors/{id}/events
// Returns the append-only event log for a single investor row, scoped to the
// caller via investor.user_id. Empty array if the investor_events table
// doesn't exist yet (fresh env, migration not yet applied).
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const guard = await requireUser(req)
  if ("error" in guard) return guard.error
  const { user } = guard
  const { id } = await ctx.params

  const supabase = getClient()

  // Belt-and-suspenders ownership check before we hand back events.
  const { data: investor } = await supabase
    .from("investors")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()
  if (!investor) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { data, error } = await supabase
    .from("investor_events")
    .select("id, event_type, payload, created_at")
    .eq("investor_id", id)
    .order("created_at", { ascending: false })
    .limit(50)

  // 42P01 = relation does not exist. The migration hasn't been applied yet
  // — return an empty list instead of a 500 so the drawer can render.
  if (error) {
    if (error.code === "42P01") return NextResponse.json([])
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
