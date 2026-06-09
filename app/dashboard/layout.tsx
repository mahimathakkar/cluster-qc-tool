import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Use service-role client so RLS never causes a false null that would
  // trigger the fallback and overwrite an existing admin role.
  const adminDb = createAdminClient()
  let { data: profile } = await adminDb
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .single()

  // New sign-up: insert only — never upsert so the role is never clobbered.
  if (!profile) {
    const { data: created } = await adminDb
      .from('profiles')
      .insert({ id: user.id, email: user.email ?? '', role: 'user' })
      .select('email, role')
      .single()
    profile = created
  }

  const displayEmail = profile?.email ?? user.email ?? ''
  const emailInitial = displayEmail.charAt(0).toUpperCase()

  return (
    <div className="app-shell">
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside className="app-sidebar">
        <Link href="/dashboard" className="sidebar-logo">
          <div className="sidebar-logo-icon">QC</div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Cluster QC</span>
        </Link>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link active">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="9" y="1" width="6" height="6" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="1" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.4"/>
            </svg>
            Projects
          </Link>

          {profile?.role === 'admin' && (
            <Link href="/admin" className="sidebar-link">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 13c0-2.5 2.7-4 6-4s6 1.5 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Admin
            </Link>
          )}
        </nav>

        <div className="sidebar-footer">
          {/* User avatar row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--accent-light)', color: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {emailInitial}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayEmail}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* ─── Main content ────────────────────────── */}
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}
