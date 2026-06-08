import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .single()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <nav style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'var(--text)' }}>
          <div style={{
            width: '1.75rem',
            height: '1.75rem',
            background: 'var(--text)',
            borderRadius: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.75rem',
          }}>
            AS
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Cluster QC</span>
        </Link>

        <div style={{ flex: 1 }} />

        {profile?.role === 'admin' && (
          <Link href="/admin" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Admin
          </Link>
        )}

        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {profile?.email}
        </span>

        <LogoutButton />
      </nav>

      <main>{children}</main>
    </div>
  )
}
