import { supabaseAdmin } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

async function approveDeal(dealId: string) {
  'use server'
  const db = supabaseAdmin()
  await db.from('deals').update({ is_active: true, approved_at: new Date().toISOString() }).eq('id', dealId)
  revalidatePath('/admin')
}

async function rejectDeal(dealId: string) {
  'use server'
  const db = supabaseAdmin()
  await db.from('deals').delete().eq('id', dealId)
  revalidatePath('/admin')
}

async function toggleDeal(dealId: string, current: boolean) {
  'use server'
  const db = supabaseAdmin()
  await db.from('deals').update({ is_active: !current }).eq('id', dealId)
  revalidatePath('/admin')
}

export default async function AdminPage() {
  const db = supabaseAdmin()

  const { data: pending } = await db
    .from('deals')
    .select('*, companies(name, email, website)')
    .eq('is_active', false)
    .is('approved_at', null)
    .order('submitted_at', { ascending: true })

  const { data: live } = await db
    .from('deals')
    .select('*, companies(name), claims(count)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('submitted_at', { ascending: false })

  return (
    <div>
      <h1 style={styles.h1}>Admin</h1>

      {/* Pending review */}
      <section style={styles.section}>
        <h2 style={styles.h2}>
          Pending review
          {pending?.length ? <span style={styles.badge}>{pending.length}</span> : null}
        </h2>

        {!pending?.length ? (
          <p style={{ color: 'var(--muted2)', fontSize: '0.875rem' }}>Nothing pending.</p>
        ) : pending.map(deal => {
          const company = (deal as any).companies
          return (
            <div key={deal.id} className="card" style={styles.dealCard}>
              <div style={styles.dealTop}>
                <div>
                  <div style={styles.dealCompany}>{company?.name}</div>
                  <div style={styles.dealTitle}>{deal.title}</div>
                  <div style={styles.dealMeta}>
                    {deal.category} · ${deal.cost_per_claim}/claim
                    {deal.budget_cap ? ` · $${deal.budget_cap} cap` : ''}
                  </div>
                </div>
                <div style={styles.actions}>
                  <form action={approveDeal.bind(null, deal.id)}>
                    <button className="btn btn-green btn-sm" type="submit">Approve</button>
                  </form>
                  <form action={rejectDeal.bind(null, deal.id)}>
                    <button className="btn btn-red btn-sm" type="submit">Reject</button>
                  </form>
                </div>
              </div>

              <p style={styles.dealDesc}>{deal.description}</p>

              <div style={styles.dealDetail}>
                <span><strong>Value:</strong> {deal.value_description}</span>
                <span><strong>Tags:</strong> {deal.tags.join(', ')}</span>
                <span><strong>Landing:</strong> <a href={deal.landing_url} target="_blank" style={{ color: 'var(--orange)' }}>{deal.landing_url}</a></span>
                <span><strong>Company email:</strong> {company?.email}</span>
              </div>
            </div>
          )
        })}
      </section>

      {/* Live deals */}
      <section style={styles.section}>
        <h2 style={styles.h2}>Live deals</h2>
        <div style={styles.table}>
          <div style={styles.tableHead}>
            <span>Deal</span>
            <span>Company</span>
            <span>Claims</span>
            <span>$/claim</span>
            <span>Featured</span>
            <span></span>
          </div>
          {(live ?? []).map(deal => {
            const company = (deal as any).companies
            const claims = (deal as any).claims?.[0]?.count ?? 0
            return (
              <div key={deal.id} style={styles.tableRow}>
                <span style={{ fontWeight: 500 }}>{deal.title}</span>
                <span style={{ color: 'var(--muted2)' }}>{company?.name}</span>
                <span style={{ color: 'var(--muted2)' }}>{claims}</span>
                <span style={{ color: 'var(--muted2)' }}>${deal.cost_per_claim}</span>
                <span>{deal.is_featured ? '⭐' : '—'}</span>
                <span>
                  <form action={toggleDeal.bind(null, deal.id, deal.is_active)}>
                    <button className="btn btn-ghost btn-sm" type="submit">Pause</button>
                  </form>
                </span>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '2rem' },
  section: { marginBottom: '3rem' },
  h2: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' },
  badge: {
    background: 'var(--orange)', color: '#fff', borderRadius: '100px',
    fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px',
  },
  dealCard: { marginBottom: '1rem' },
  dealTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' },
  dealCompany: { fontSize: '0.75rem', color: 'var(--orange)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '2px' },
  dealTitle: { fontSize: '1rem', fontWeight: 600 },
  dealMeta: { fontSize: '0.8rem', color: 'var(--muted2)', marginTop: '2px' },
  actions: { display: 'flex', gap: '8px', flexShrink: 0 },
  dealDesc: { fontSize: '0.875rem', color: 'var(--muted2)', marginBottom: '0.75rem', lineHeight: 1.6 },
  dealDetail: { display: 'flex', flexDirection: 'column' as const, gap: '4px', fontSize: '0.8rem', color: 'var(--muted2)' },
  table: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' },
  tableHead: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
    padding: '10px 16px', borderBottom: '1px solid var(--border)',
    fontSize: '0.72rem', fontWeight: 600, color: 'var(--muted2)', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
    padding: '12px 16px', borderBottom: '1px solid var(--border)',
    fontSize: '0.875rem', alignItems: 'center',
  },
}
