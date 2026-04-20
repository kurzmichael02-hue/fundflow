import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Explicit allowlist — if the directory table ever grows internal columns
// (contact emails, internal scoring notes, plan metadata, etc.), `*` would
// leak them through this public endpoint without anyone noticing. Listing
// the fields the frontend actually uses means a schema addition stays
// invisible until someone wires it up here on purpose.
const PUBLIC_COLUMNS = [
  "id", "name", "firm", "sector", "stage",
  "check_size_min", "check_size_max",
  "web3_focus", "location", "website",
].join(", ")

export async function GET(req: NextRequest) {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from("investor_directory")
      .select(PUBLIC_COLUMNS)
      .order("name", { ascending: true })
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}