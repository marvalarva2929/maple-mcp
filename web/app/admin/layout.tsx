import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh' }}>
      <nav style={styles.nav}>
        <Link href="/admin" style={styles.logo}>🍁 maple admin</Link>
      </nav>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 2rem',
    height: '56px',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
  },
  logo: { fontWeight: 700, color: 'var(--orange)', fontSize: '1rem' },
  main: { padding: '2.5rem 2rem', maxWidth: '1000px', margin: '0 auto' },
}
