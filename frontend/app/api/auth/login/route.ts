import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Lazy init — constructing supabase at module load throws during
// Next.js page-data collection when env vars aren't available.
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ 
    token: data.session?.access_token,
    user: data.user 
  })
}