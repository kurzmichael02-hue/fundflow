import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { requireUser } from "@/lib/auth"
import { rateLimit } from "@/lib/ratelimit"

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

// The directory is the biggest chunk of value we ship — 30+ curated funds.
// Used to be public-unauthenticated, which meant anyone could `curl` it in
// a loop and walk away with the whole list. Two changes:
//   · requireUser — a sign-in is now the bar. Free users still see it, we
//     just know who's pulling it. The frontend already checks token at
//     mount, this closes the back-door route.
//   · rateLimit — 60 per hour per IP. Legit scrolling / re-load usage
//     doesn't come close; a scraper trying to hoard the list gets 429.
export async function GET(req: NextRequest) {
  const limited = await rateLimit(req, "investor-directory", 60, "1 h")
  if (limited) return limited

  const guard = await requireUser(req)
  if ("error" in guard) return guard.error

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