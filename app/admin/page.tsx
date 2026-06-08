import { createClient } from '@/lib/supabase/server'

export default async function AdminOverviewPage() {
  const supabase = createClient()

  const [
    { count: totalUsers },
    { data: projects },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('status, created_at'),
  ])

  const allProjects = projects ?? []
  const active = allProjects.filter(p => p.status === 'active').length
  const completed = allProjects.filter(p => p.status === 'completed').length
  const archived = allProjects.filter(p => p.status === 'archived').length

  // Signups over last 7 days
  const { data: recentProfiles } = await supabase
    .from('profiles')
    .select('created_at')
    .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Overview</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total users" value={totalUsers ?? 0} color="var(--blue)" />
        <StatCard label="Total projects" value={allProjects.length} color="var(--purple)" />
        <StatCard label="Active" value={active} color="var(--blue)" />
        <StatCard label="Completed" value={completed} color="var(--green)" />
        <StatCard label="Archived" value={archived} color="var(--text-muted)" />
        <StatCard label="Signups (7d)" value={recentProfiles?.length ?? 0} color="var(--amber)" />
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Admin panel is read-only. Use the <a href="/admin/users" style={{ color: 'var(--blue)' }}>Users</a> page to see individual accounts and their projects.
        </p>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value.toLocaleString()}</div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
    </div>
  )
}
