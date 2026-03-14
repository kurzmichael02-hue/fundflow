import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    return decoded.sub || null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = getUserIdFromToken(token)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getClient()
  const { data, error } = await supabase
    .from('investors')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = getUserIdFromToken(token)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = getClient()

  // Feature gating — check plan and investor count
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, subscription_status')
    .eq('id', userId)
    .single()

  const isPro = profile?.plan === 'pro'

  if (!isPro) {
    const { count } = await supabase
      .from('investors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if ((count ?? 0) >= 25) {
      return NextResponse.json(
        { error: 'Free plan limit reached. Upgrade to Pro for unlimited investors.', limit: true },
        { status: 403 }
      )
    }
  }

  const body = await req.json()

  const { data, error } = await supabase
    .from('investors')
    .insert({ ...body, user_id: userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = getUserIdFromToken(token)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = getClient()
  const body = await req.json()
  const { id: _id, user_id: _uid, created_at: _ca, ...updateData } = body

  const { data, error } = await supabase
    .from('investors')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = getUserIdFromToken(token)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = getClient()
  const { error } = await supabase
    .from('investors')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Deleted' })
}