'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Stage = 'form' | 'confirm'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [stage, setStage] = useState<Stage>('form')
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleGoogleSignIn() {
    setError('')
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }

    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Callback route handles both email confirmation and OAuth
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If session exists immediately, email confirmation is disabled — user is already logged in
    if (data.session) {
      window.location.href = '/dashboard'
      return
    }

    // Otherwise show the confirmation-pending screen
    setLoading(false)
    setStage('confirm')
  }

  async function handleResend() {
    setResendStatus('sending')
    const supabase = createClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setResendStatus(error ? 'error' : 'sent')
    if (error === null) {
      setTimeout(() => setResendStatus('idle'), 5000)
    }
  }

  if (stage === 'confirm') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center', padding: '0.5rem 0' }}>
        <div style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '9999px',
          background: 'var(--blue-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
        }}>
          ✉️
        </div>

        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Check your email</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            We sent a confirmation link to:
          </p>
          <p style={{ fontWeight: 600, marginTop: '0.25rem', wordBreak: 'break-all' }}>{email}</p>
        </div>

        <div className="card" style={{ padding: '1rem', width: '100%', textAlign: 'left' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Click the link in the email to activate your account and log in. The link expires after 24 hours.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'sending' || resendStatus === 'sent'}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}
          >
            {resendStatus === 'sending' && 'Sending…'}
            {resendStatus === 'sent' && '✓ Email resent'}
            {resendStatus === 'error' && 'Failed to resend — try again'}
            {resendStatus === 'idle' && 'Resend confirmation email'}
          </button>

          {resendStatus === 'sent' && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--green)', textAlign: 'center' }}>
              Check your inbox again.
            </p>
          )}
        </div>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Can&apos;t find it? Check your spam folder.
        </p>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Already confirmed?{' '}
          <Link href="/auth/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {error && (
        <div style={{ padding: '0.75rem', background: 'var(--red-light)', color: '#b91c1c', borderRadius: '8px', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.625rem',
          width: '100%',
          padding: '0.625rem',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          background: 'var(--surface)',
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'background 0.15s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'var(--bg)')}
        onMouseOut={e => (e.currentTarget.style.background = 'var(--surface)')}
      >
        {googleLoading ? (
          <span>Redirecting…</span>
        ) : (
          <>
            <GoogleIcon />
            Continue with Google
          </>
        )}
      </button>

      <OrDivider />

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || googleLoading}
          style={{ width: '100%', justifyContent: 'center', padding: '0.625rem' }}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href="/auth/login" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 500 }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}

function OrDivider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>or</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
