import { supabase, supabaseAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createStripeCustomer } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

async function saveCompany(formData: FormData) {
  'use server'
  const db = await supabase()
  const { data: { user } } = await db.auth.getUser()
  if (!user?.email) return

  const name = formData.get('name') as string
  const website = formData.get('website') as string

  const stripeCustomerId = await createStripeCustomer(user.email, name)

  const admin = supabaseAdmin()
  await admin.from('companies').upsert({
    email: user.email,
    name,
    website: website || null,
    ...(stripeCustomerId ? { stripe_customer_id: stripeCustomerId } : {}),
  }, { onConflict: 'email' })

  redirect('/partners')
}

export default function OnboardPage() {
  return (
    <div style={{ maxWidth: '480px' }}>
      <h1 style={styles.h1}>Welcome to Maple Partners</h1>
      <p style={styles.sub}>Tell us about your company to get started.</p>

      <form action={saveCompany} style={styles.form}>
        <div className="field">
          <label>Company name</label>
          <input name="name" placeholder="Acme Inc." required />
        </div>
        <div className="field">
          <label>Website</label>
          <input name="website" type="url" placeholder="https://acme.com" />
        </div>
        <button className="btn btn-orange" type="submit">Continue →</button>
      </form>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '0.5rem' },
  sub: { color: 'var(--muted2)', marginBottom: '2rem', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0' },
}
