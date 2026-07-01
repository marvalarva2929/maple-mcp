'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const db = supabaseBrowser()
    const { error } = await db.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <div style={styles.logo}>🍁 maple partners</div>

        {sent ? (
          <div>
            <div style={styles.title}>Check your email</div>
            <p style={styles.sub}>
              We sent a sign-in link to <strong>{email}</strong>.<br />
              Click it to access your partner dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={styles.title}>Partner sign in</div>
            <p style={styles.sub}>Enter your company email to get a sign-in link.</p>

            {error && <div className="error-box">{error}</div>}

            <div className="field">
              <label>Company email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                required
                autoFocus
              />
            </div>

            <button className="btn btn-orange btn-full" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  box: {
    background: 'var(--surface)',
    border: '1px solid var(--border2)',
    borderRadius: '16px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
  },
  logo: {
    fontSize: '1.1rem',
    fontWeight: 700,
    marginBottom: '2rem',
    color: 'var(--orange)',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
  },
  sub: {
    color: 'var(--muted2)',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    lineHeight: 1.6,
  },
}
