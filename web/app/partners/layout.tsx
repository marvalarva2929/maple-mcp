import { supabase } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PartnersLayout({ children }: { children: React.ReactNode }) {
  const db = await supabase()
  const { data: { user } } = await db.auth.getUser()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={styles.nav}>
        <Link href="/partners" style={styles.logo}>🍁 maple partners</Link>
        <div style={styles.navRight}>
          {user && <span style={styles.email}>{user.email}</span>}
          {user && (
            <form action="/auth/signout" method="post">
              <button className="btn btn-ghost btn-sm" type="submit">Sign out</button>
            </form>
          )}
        </div>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '56px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
  },
  logo: { fontWeight: 700, color: 'var(--orange)', fontSize: '1rem' },
  navRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  email: { fontSize: '0.8rem', color: 'var(--muted2)' },
  main: { flex: 1, padding: '2.5rem 2rem', maxWidth: '860px', margin: '0 auto', width: '100%' },
}
