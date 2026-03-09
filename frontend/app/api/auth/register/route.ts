import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // create profile
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      name,
      email,
      user_type: 'founder'
    })
  }

  return NextResponse.json({ message: 'Success' })
}