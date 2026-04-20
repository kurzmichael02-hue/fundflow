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
// `next_follow_up_at` and `last_contacted_at` accept ISO-8601 strings or
// null (null = clear the reminder).
const INVESTOR_WRITABLE_FIELDS = [
  "name", "company", "email", "status", "deal_size", "notes",
  "next_follow_up_at", "last_contacted_at",
] as const

function pickInvestorFields(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {}
  for (const f of INVESTOR_WRITABLE_FIELDS) {
    if (f in body) {
      const v = body[f]
      // The two timestamp fields: accept null to clear, or a string we can
      // coerce. Anything else we drop on the floor — don't want "asap" or
      // 42 sneaking into a TIMESTAMPTZ column.
      if (f === "next_follow_up_at" || f === "last_contacted_at") {
        if (v === null) out[f] = null
        else if (typeof v === "string" && v.trim()) {
          const parsed = new Date(v)
          if (!isNaN(parsed.getTime())) out[f] = parsed.toISOString()
        }
        continue
      }
      out[f] = v
    }
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

  // Seed the timeline with a "created" event so the drawer always has at
  // least one row to show, instead of an empty list on a brand-new investor.
  try {
    await supabase.from("investor_events").insert({
      investor_id: data.id,
      user_id: user.id,
      event_type: "created",
      payload: { status: data.status },
    })
  } catch (e) {
    console.warn("investor_events seed failed:", e)
  }

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

  // Read the row before the write so we can diff it for the timeline.
  // user_id in the WHERE keeps a malicious id from leaking another user's
  // investor (the update below has the same scoping).
  const { data: before } = await supabase
    .from("investors")
    .select("status, notes, deal_size, name, next_follow_up_at, last_contacted_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle()

  const { data, error } = await supabase
    .from("investors")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Best-effort timeline write. Wrapped so a missing investor_events
  // table (fresh env, migration not yet applied) doesn't break the PATCH.
  if (before) {
    try {
      await recordChanges(supabase, id, user.id, before, data)
    } catch (e) {
      console.warn("investor_events write failed:", e)
    }
  }

  return NextResponse.json(data)
}

// Diff before/after and write one event per meaningful field change. Status
// and notes get their own event types so the UI can render them differently
// (icon, copy, payload shape). Deal-size + name updates collapse into a
// generic "field_updated" so we don't grow the type list forever.
type DiffRow = {
  status?: string | null
  notes?: string | null
  deal_size?: string | null
  name?: string | null
  next_follow_up_at?: string | null
  last_contacted_at?: string | null
}

async function recordChanges(
  supabase: ReturnType<typeof getClient>,
  investorId: string,
  userId: string,
  before: DiffRow,
  after:  DiffRow,
) {
  const events: Array<{ investor_id: string; user_id: string; event_type: string; payload: Record<string, unknown> }> = []

  if (before.status !== after.status && after.status) {
    events.push({
      investor_id: investorId,
      user_id: userId,
      event_type: "status_changed",
      payload: { from: before.status, to: after.status },
    })
  }
  if ((before.notes || "") !== (after.notes || "")) {
    events.push({
      investor_id: investorId,
      user_id: userId,
      event_type: "notes_updated",
      payload: { length: (after.notes || "").length },
    })
  }
  if ((before.deal_size || "") !== (after.deal_size || "")) {
    events.push({
      investor_id: investorId,
      user_id: userId,
      event_type: "deal_size_changed",
      payload: { from: before.deal_size, to: after.deal_size },
    })
  }
  if ((before.name || "") !== (after.name || "") && after.name) {
    events.push({
      investor_id: investorId,
      user_id: userId,
      event_type: "renamed",
      payload: { from: before.name, to: after.name },
    })
  }
  // Follow-up changes: three shapes — set, cleared, or rescheduled. We
  // split them so the timeline reads cleanly ("Reminder cleared" vs.
  // "Reminder set for Nov 3"), and so downstream "you have X overdue"
  // copy can look backwards through the log without parsing payloads.
  const beforeFu = before.next_follow_up_at || null
  const afterFu  = after.next_follow_up_at  || null
  if (beforeFu !== afterFu) {
    if (afterFu && !beforeFu) {
      events.push({
        investor_id: investorId,
        user_id: userId,
        event_type: "follow_up_set",
        payload: { at: afterFu },
      })
    } else if (!afterFu && beforeFu) {
      events.push({
        investor_id: investorId,
        user_id: userId,
        event_type: "follow_up_cleared",
        payload: { from: beforeFu },
      })
    } else {
      events.push({
        investor_id: investorId,
        user_id: userId,
        event_type: "follow_up_rescheduled",
        payload: { from: beforeFu, to: afterFu },
      })
    }
  }
  if ((before.last_contacted_at || null) !== (after.last_contacted_at || null) && after.last_contacted_at) {
    events.push({
      investor_id: investorId,
      user_id: userId,
      event_type: "contacted",
      payload: { at: after.last_contacted_at },
    })
  }

  if (events.length === 0) return
  await supabase.from("investor_events").insert(events)
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
