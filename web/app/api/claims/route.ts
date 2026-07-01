import { supabaseAdmin } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { discount_id } = await request.json().catch(() => ({}))

  if (!discount_id) {
    return NextResponse.json({ error: 'discount_id required' }, { status: 400 })
  }

  const db = supabaseAdmin()

  const { error } = await db
    .from('claims')
    .insert({ deal_id: discount_id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
