import { supabase, supabaseAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CATEGORIES } from '@/lib/types'

export const dynamic = 'force-dynamic'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function submitDeal(formData: FormData) {
  'use server'
  const db = await supabase()
  const { data: { user } } = await db.auth.getUser()
  if (!user?.email) return

  const admin = supabaseAdmin()
  const { data: company } = await admin
    .from('companies')
    .select('id')
    .eq('email', user.email)
    .single()

  if (!company) return

  const title = formData.get('title') as string
  const rawTags = formData.get('tags') as string
  const tags = rawTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

  // Generate a unique slug from company name + title
  const { data: companyRow } = await admin.from('companies').select('name').eq('id', company.id).single()
  const baseSlug = slugify(`${companyRow?.name ?? 'company'}-${title}`)

  // Ensure uniqueness
  const { data: existing } = await admin.from('deals').select('id').like('id', `${baseSlug}%`)
  const id = existing?.length ? `${baseSlug}-${existing.length}` : baseSlug

  await admin.from('deals').insert({
    id,
    company_id: company.id,
    title,
    description: formData.get('description') as string,
    category: formData.get('category') as string,
    tags,
    value_description: formData.get('value_description') as string,
    landing_url: formData.get('landing_url') as string,
    cost_per_claim: parseFloat(formData.get('cost_per_claim') as string) || 0,
    budget_cap: formData.get('budget_cap') ? parseFloat(formData.get('budget_cap') as string) : null,
    is_active: false,
  })

  redirect('/partners?submitted=1')
}

export default function SubmitPage() {
  return (
    <div style={{ maxWidth: '600px' }}>
      <h1 style={styles.h1}>Submit a deal</h1>
      <p style={styles.sub}>
        Your deal will be reviewed before going live. We typically approve within 24 hours.
      </p>

      <form action={submitDeal}>
        <div className="field">
          <label>Deal title</label>
          <input name="title" placeholder="3 Months Free on Pro Plan" required />
          <div className="field-hint">Keep it short and value-focused.</div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            name="description"
            placeholder="What does your product do, and what exactly does this deal include?"
            required
          />
        </div>

        <div className="field">
          <label>Value to developer</label>
          <input name="value_description" placeholder="3 months free (~$75 value)" required />
          <div className="field-hint">What the developer gets, with an approximate dollar value.</div>
        </div>

        <div className="field">
          <label>Category</label>
          <select name="category" required>
            <option value="">Select a category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Tags</label>
          <input name="tags" placeholder="postgres, database, sql, backend" />
          <div className="field-hint">
            Comma-separated keywords. These determine when your deal appears in agent recommendations.
            Think about what problems your tool solves and what technologies it pairs with.
          </div>
        </div>

        <div className="field">
          <label>Your landing page URL</label>
          <input name="landing_url" type="url" placeholder="https://yoursite.com/maple" required />
          <div className="field-hint">
            Where developers land after clicking the deal link.
            You control this page — just make sure the deal is visible when they arrive.
          </div>
        </div>

        <div style={styles.row}>
          <div className="field" style={{ flex: 1 }}>
            <label>Cost per claim ($)</label>
            <input name="cost_per_claim" type="number" min="0" step="0.01" placeholder="5.00" required />
            <div className="field-hint">What you pay Maple each time a developer claims this deal.</div>
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Monthly budget cap ($)</label>
            <input name="budget_cap" type="number" min="0" step="1" placeholder="500" />
            <div className="field-hint">Optional. Pauses the deal when reached.</div>
          </div>
        </div>

        <div style={styles.footer}>
          <a href="/partners" className="btn btn-ghost">Cancel</a>
          <button className="btn btn-orange" type="submit">Submit for review →</button>
        </div>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.5rem' },
  sub: { color: 'var(--muted2)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.6 },
  row: { display: 'flex', gap: '1rem' },
  footer: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' },
}
