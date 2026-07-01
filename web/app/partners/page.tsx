import { supabase, supabaseAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const db = await supabase()
  const { data: { user } } = await db.auth.getUser()
  if (!user?.email) redirect('/partners/login')

  const admin = supabaseAdmin()

  // Get company
  const { data: company } = await admin
    .from('companies')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!company?.name) redirect('/partners/onboard')

  // Get deals with claim counts
  const { data: deals } = await admin
    .from('deals')
    .select('*, claims(count)')
    .eq('company_id', company.id)
    .order('submitted_at', { ascending: false })

  const totalClaims = (deals ?? []).reduce((n, d) => n + (d.claims?.[0]?.count ?? 0), 0)
  const totalSpend = (deals ?? []).reduce(
    (n, d) => n + (d.claims?.[0]?.count ?? 0) * d.cost_per_claim, 0
  )

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>{company.name}</h1>
          <p style={styles.sub}>Partner dashboard</p>
        </div>
        <Link href="/partners/submit" className="btn btn-orange">+ New deal</Link>
      </div>

      {/* Stats */}
      <div style={styles.stats}>
        <div className="card" style={styles.stat}>
          <div style={styles.statVal}>{totalClaims}</div>
          <div style={styles.statLabel}>Total claims</div>
        </div>
        <div className="card" style={styles.stat}>
          <div style={styles.statVal}>${totalSpend.toFixed(0)}</div>
          <div style={styles.statLabel}>Total spend</div>
        </div>
        <div className="card" style={styles.stat}>
          <div style={styles.statVal}>{(deals ?? []).filter(d => d.is_active).length}</div>
          <div style={styles.statLabel}>Active deals</div>
        </div>
      </div>

      {/* Deals table */}
      <h2 style={styles.h2}>Your deals</h2>
      {!deals?.length ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted2)' }}>
          No deals yet. <Link href="/partners/submit" style={{ color: 'var(--orange)' }}>Submit your first deal →</Link>
        </div>
      ) : (
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Deal</span>
            <span>Status</span>
            <span>Claims</span>
            <span>$/claim</span>
            <span>Spend</span>
          </div>
          {deals.map(deal => {
            const claims = deal.claims?.[0]?.count ?? 0
            const spend = claims * deal.cost_per_claim
            const status = deal.is_active ? 'active' : deal.approved_at ? 'paused' : 'pending'
            return (
              <div key={deal.id} style={styles.tableRow}>
                <span style={{ fontWeight: 500 }}>{deal.title}</span>
                <span>
                  <span className={`badge badge-${status === 'active' ? 'green' : status === 'pending' ? 'orange' : 'gray'}`}>
                    {status}
                  </span>
                </span>
                <span style={{ color: 'var(--muted2)' }}>{claims}</span>
                <span style={{ color: 'var(--muted2)' }}>${deal.cost_per_claim.toFixed(2)}</span>
                <span style={{ color: 'var(--muted2)' }}>${spend.toFixed(2)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' },
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em' },
  sub: { color: 'var(--muted2)', fontSize: '0.875rem', marginTop: '2px' },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' },
  stat: { textAlign: 'center' as const },
  statVal: { fontSize: '2rem', fontWeight: 800, color: 'var(--orange)', letterSpacing: '-0.04em' },
  statLabel: { fontSize: '0.8rem', color: 'var(--muted2)', marginTop: '2px' },
  h2: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' },
  table: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
    padding: '10px 16px', borderBottom: '1px solid var(--border)',
    fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted2)', textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
    padding: '14px 16px', borderBottom: '1px solid var(--border)',
    fontSize: '0.875rem', alignItems: 'center',
  },
}
