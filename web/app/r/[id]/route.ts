import { supabaseAdmin } from '@/lib/supabase/server'
import { chargeCompany } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = supabaseAdmin()

  // Fetch deal + company in one query
  const { data: deal, error } = await db
    .from('deals')
    .select('id, landing_url, cost_per_claim, is_active, companies(stripe_customer_id, name)')
    .eq('id', id)
    .single()

  if (error || !deal) {
    return NextResponse.redirect('https://maple.dev', { status: 302 })
  }

  if (!deal.is_active) {
    return NextResponse.redirect('https://maple.dev', { status: 302 })
  }

  // Insert claim row
  const { data: claim } = await db
    .from('claims')
    .insert({ deal_id: id })
    .select('id')
    .single()

  // Charge company if billing is set up (non-blocking — redirect always fires)
  if (claim && deal.cost_per_claim > 0) {
    const company = (deal as any).companies
    if (company?.stripe_customer_id) {
      chargeCompany(
        company.stripe_customer_id,
        deal.cost_per_claim,
        `Maple claim: ${id}`
      ).then(async ({ charged, chargeId, error: chargeError }) => {
        if (charged && chargeId) {
          await db
            .from('claims')
            .update({ charged_at: new Date().toISOString(), amount_charged: deal.cost_per_claim })
            .eq('id', claim.id)
        } else if (chargeError) {
          console.error(`Charge failed for ${id}:`, chargeError)
        }
      })
    }
  }

  // Mark redirect timestamp
  if (claim) {
    db.from('claims').update({ redirected_at: new Date().toISOString() }).eq('id', claim.id)
  }

  return NextResponse.redirect(deal.landing_url, { status: 302 })
}
