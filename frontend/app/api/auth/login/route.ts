import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { rateLimit } from "@/lib/ratelimit"

// Lazy init — constructing supabase at module load throws during
// Next.js page-data collection when env vars aren't available.
function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}

const ALLOWED_PORTALS = new Set(["founder", "investor"])

export async function POST(req: NextRequest) {
  // Per-IP throttle so nobody can burn through password guesses. The second
  // check keys on the email too — otherwise an attacker could rotate IPs to
  // brute one account. We normalise the email before keying so "Foo@x" and
  // "foo@x" share the same bucket.
  const ipLimited = await rateLimit(req, "auth-login-ip", 10, "1 m")
  if (ipLimited) return ipLimited

  const body = await req.json()
  const normalisedEmail = String(body.email || "").trim().toLowerCase()
  const password = String(body.password || "")
  const portalRaw = String(body.portal || "").toLowerCase()
  const portal = ALLOWED_PORTALS.has(portalRaw) ? portalRaw : null

  if (!normalisedEmail || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  const emailLimited = await rateLimit(req, "auth-login-email", 5, "5 m", normalisedEmail)
  if (emailLimited) return emailLimited

  const { data, error } = await getAnonClient().auth.signInWithPassword({
    email: normalisedEmail,
    password,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data.user) return NextResponse.json({ error: "Sign in failed" }, { status: 400 })

  // Look up the account's user_type so we can (a) reject logins from the
  // wrong portal and (b) return it to the client for routing.
  const service = getServiceClient()
  const { data: profile } = await service
    .from("profiles")
    .select("user_type")
    .eq("id", data.user.id)
    .single()

  const user_type = (profile?.user_type as string | undefined) || "founder"

  if (portal && user_type !== portal) {
    // Don't leak which accounts exist — just tell the user this isn't the
    // right door. The other portal is linked in the UI anyway.
    return NextResponse.json(
      {
        error: portal === "investor"
          ? "This account isn't registered as an investor. Sign in at /login instead."
          : "This account isn't registered as a founder. Sign in at /investor instead.",
      },
      { status: 403 },
    )
  }

  return NextResponse.json({
    token: data.session?.access_token,
    user: data.user,
    user_type,
  })
}
