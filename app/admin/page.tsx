import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  const db = createAdminClient()

  const [
    { count: totalUsers },
    { data: projects },
    { data: recentProfiles },
  ] = await Promise.all([
    db.from('profiles').select('*', { count: 'exact', head: true }),
    db.from('projects').select('status, created_at'),
    db.from('profiles').select('created_at').gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
  ])

  const allProjects = projects ?? []
  const active = allProjects.filter(p => p.status === 'active').length
  const completed = allProjects.filter(p => p.status === 'completed').length
  const archived = allProjects.filter(p => p.status === 'archived').length

  return (
    <div className="page-fade" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Overview</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>
        Workspace-wide stats across all users.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total users" value={totalUsers ?? 0} color="var(--blue)" />
        <StatCard label="Total projects" value={allProjects.length} color="var(--purple)" />
        <StatCard label="Active" value={active} color="var(--blue)" />
        <StatCard label="Completed" value={completed} color="var(--green)" />
        <StatCard label="Archived" value={archived} color="var(--text-muted)" />
        <StatCard label="Signups (7d)" value={recentProfiles?.length ?? 0} color="var(--amber)" />
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Admin panel is read-only. Use the{' '}
          <a href="/admin/users" style={{ color: 'var(--accent)' }}>Users</a> page to see individual accounts and their projects.
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontSize: 40, fontWeight: 700, color, lineHeight: 1.1 }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{label}</div>
    </div>
  )
}
