import { createClient, PostgrestError } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/ratelimit"

// anon client for the signUp call — lazy so the module can be loaded during
// Next.js page-data collection without env vars blowing up.
function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

// service-role client for everything else in this route:
// - profile insert (bypass RLS)
// - admin.deleteUser rollback when the profile write fails
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ALLOWED_USER_TYPES = ["founder", "investor"] as const
type UserType = typeof ALLOWED_USER_TYPES[number]

const PG_FOREIGN_KEY_VIOLATION = "23503"
const PG_UNIQUE_VIOLATION = "23505"

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth-register", 5, "1 h")
  if (limited) return limited

  const body = await req.json()
  const name = String(body.name || "").trim()
  const email = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")
  const rawType = String(body.user_type || "founder").toLowerCase()
  const user_type: UserType = (ALLOWED_USER_TYPES as readonly string[]).includes(rawType)
    ? (rawType as UserType)
    : "founder"

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 })
  }
  if (!EMAIL_RX.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const { data, error } = await getAnonClient().auth.signUp({
    email,
    password,
    options: { data: { name } },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data.user) return NextResponse.json({ error: "Sign up failed" }, { status: 500 })

  // Supabase signal for "this email is already registered (and confirmed)":
  // signUp succeeds but returns a user object with an empty identities array
  // and no fresh session. Catch it explicitly so the user gets a useful
  // message instead of running into the FK violation a few lines down.
  const identities = data.user.identities
  if (Array.isArray(identities) && identities.length === 0) {
    return NextResponse.json(
      { error: "An account with this email already exists. Sign in instead." },
      { status: 409 },
    )
  }

  const service = getServiceClient()

  // Idempotency: if a profile row already exists for this auth user, we're
  // in the "user clicked Register a second time after a successful one"
  // case. Treat it as success rather than throwing a unique-key error.
  const { data: existingProfile } = await service
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle()
  if (existingProfile) {
    return NextResponse.json({ message: "Success" })
  }

  // Create the profile row. If this fails for an unexpected reason, we roll
  // back the auth user — otherwise a duplicate or flaky insert leaves an
  // orphan auth user that can log in but has no profile row.
  const { error: profileError } = await service.from("profiles").insert({
    id: data.user.id,
    name,
    email,
    user_type,
    plan: "free",
  })

  if (profileError) {
    const pgErr = profileError as PostgrestError
    // Two specific failures we can give a clear, actionable message for:
    if (pgErr.code === PG_UNIQUE_VIOLATION) {
      // Profile already there — same idempotency case as above, but raced.
      return NextResponse.json({ message: "Success" })
    }
    if (pgErr.code === PG_FOREIGN_KEY_VIOLATION) {
      // The auth user we just created (or thought we did) isn't in
      // auth.users when the FK lookup runs. Usually means an earlier
      // rollback removed it but Supabase's signUp returned the cached
      // identity, or a replication delay between auth and the public
      // schema. Best response is to ask the user to try again — a fresh
      // signUp call will mint a new id.
      console.warn("Register FK violation for", data.user.id, pgErr.details)
      return NextResponse.json(
        {
          error: "Couldn't link that account yet — try signing in. If that fails, register again in a moment.",
        },
        { status: 409 },
      )
    }
    // Unknown failure: best-effort rollback so we don't leave an orphan
    // auth user behind.
    await service.auth.admin.deleteUser(data.user.id).catch(() => {})
    return NextResponse.json({ error: pgErr.message }, { status: 500 })
  }

  return NextResponse.json({ message: "Success" })
}
