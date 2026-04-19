import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'

// anon client for the signUp call — lazy so the module can be loaded during
// Next.js page-data collection without env vars blowing up.
function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// service-role client for everything else in this route:
// - profile insert (bypass RLS)
// - admin.deleteUser rollback when the profile write fails
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ALLOWED_USER_TYPES = ['founder', 'investor'] as const
type UserType = typeof ALLOWED_USER_TYPES[number]

export async function POST(req: NextRequest) {
  // Registrations are cheap to create but scrapers use open signup endpoints
  // to find email-enumeration and bulk-account flaws. 5 per IP per hour
  // keeps legit signups unaffected while killing automated fuzzing.
  const limited = await rateLimit(req, "auth-register", 5, "1 h")
  if (limited) return limited

  const body = await req.json()
  const name = String(body.name || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  // user_type comes from the client — default to founder for the legacy
  // /register page, but /investor/register now correctly sets "investor"
  // so investors actually land in the right portal on login.
  const rawType = String(body.user_type || 'founder').toLowerCase()
  const user_type: UserType = (ALLOWED_USER_TYPES as readonly string[]).includes(rawType)
    ? (rawType as UserType)
    : 'founder'

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
  }
  if (!EMAIL_RX.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const { data, error } = await getAnonClient().auth.signUp({
    email,
    password,
    options: { data: { name } }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (!data.user) return NextResponse.json({ error: 'Sign up failed' }, { status: 500 })

  // Create the profile row. If this fails, we roll back the auth user —
  // otherwise a duplicate or flaky insert leaves an orphan user that can log
  // in but has no profile row, which breaks every downstream /api/* call.
  const service = getServiceClient()
  const { error: profileError } = await service.from('profiles').insert({
    id: data.user.id,
    name,
    email,
    user_type,
    plan: 'free',
  })

  if (profileError) {
    // best-effort rollback — if the deleteUser itself fails we still surface
    // the original profile error so the user at least sees the real problem
    await service.auth.admin.deleteUser(data.user.id).catch(() => {})
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Success' })
}