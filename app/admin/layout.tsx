import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/auth/LogoutButton'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const adminDb = createAdminClient()
  let { data: profile } = await adminDb
    .from('profiles')
    .select('email, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const { data: created } = await adminDb
      .from('profiles')
      .insert({ id: user.id, email: user.email ?? '', role: 'user' })
      .select('email, role')
      .single()
    profile = created
  }

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const displayEmail = profile?.email ?? user.email ?? ''
  const emailInitial = displayEmail.charAt(0).toUpperCase()

  return (
    <div className="app-shell">
      {/* ─── Sidebar ─────────────────────────────── */}
      <aside className="app-sidebar">
        <Link href="/admin" className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'var(--purple)' }}>AD</div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Admin Panel</span>
        </Link>

        <AdminNav />

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--purple-light)', color: 'var(--purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>
              {emailInitial}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayEmail}
            </span>
          </div>
          <Link href="/dashboard" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none', padding: '4px 2px', display: 'block' }}>
            ← My projects
          </Link>
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
