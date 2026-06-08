'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/login` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If email confirmation is disabled, redirect immediately
    setSuccess(true)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (success) {
    return (
      <div style={{
        padding: '1.5rem',
        background: 'var(--green-light)',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✓</div>
        <p style={{ fontWeight: 600 }}>Account created!</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Redirecting to your dashboard…
        </p>
      </div>
    )
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
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem' }}>
          Confirm password
        </label>
        <input
          type="password"
          className="input"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}>
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </form>
  )
}
