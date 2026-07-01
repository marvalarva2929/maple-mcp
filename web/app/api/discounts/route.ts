import { supabaseAdmin } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const db = supabaseAdmin()

  const { data, error } = await db
    .from('deals')
    .select('id, title, description, category, tags, value_description, is_featured, expires_at, companies(name)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('submitted_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://maple.dev'

  const discounts = (data ?? []).map((d: any) => ({
    id: d.id,
    company: d.companies?.name ?? '',
    title: d.title,
    description: d.description,
    category: d.category,
    tags: d.tags,
    discount_value: d.value_description,
    tracking_url: `${base}/r/${d.id}`,
    is_featured: d.is_featured,
    expires_at: d.expires_at,
  }))

  return NextResponse.json({ discounts }, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
