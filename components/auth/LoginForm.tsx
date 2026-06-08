'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div style={{
          padding: '0.75rem',
          background: 'var(--red-light)',
          color: '#b91c1c',
          borderRadius: '8px',
          fontSize: '0.875rem',
        }}>
          {error}
        </div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
          Email
        </label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoFocus
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
          Password
        </label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
          Sign up
        </Link>
      </p>
    </form>
  )
}
