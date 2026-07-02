import { supabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const db = await supabase()
  await db.auth.signOut()
  return NextResponse.redirect(new URL('/partners/login', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'), { status: 302 })
}
