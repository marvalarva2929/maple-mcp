import { supabase, supabaseAdmin } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const db = await supabase()
    const { data: { user }, error } = await db.auth.exchangeCodeForSession(code)

    if (!error && user?.email) {
      // Create company row on first login
      const admin = supabaseAdmin()
      const { data: existing } = await admin
        .from('companies')
        .select('id, name')
        .eq('email', user.email)
        .single()

      if (!existing) {
        // New company — send to onboarding
        return NextResponse.redirect(`${origin}/partners/onboard`)
      }

      if (!existing.name) {
        return NextResponse.redirect(`${origin}/partners/onboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/partners`)
}
