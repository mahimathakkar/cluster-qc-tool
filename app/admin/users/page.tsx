import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminUsersPage() {
  const supabase = createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, role, created_at')
    .order('created_at', { ascending: false })

  // Get project counts per user
  const { data: projectCounts } = await supabase
    .from('projects')
    .select('user_id')

  const countMap = new Map<string, number>()
  for (const p of projectCounts ?? []) {
    countMap.set(p.user_id, (countMap.get(p.user_id) ?? 0) + 1)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Users ({profiles?.length ?? 0})
      </h1>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              {['Email', 'Role', 'Projects', 'Signup date', ''].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map(profile => (
              <tr key={profile.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{profile.email}</td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span className={profile.role === 'admin' ? 'badge badge-purple' : 'badge badge-gray'} style={{ background: profile.role === 'admin' ? 'var(--purple-light)' : '#f3f4f6', color: profile.role === 'admin' ? '#5b21b6' : '#374151' }}>
                    {profile.role}
                  </span>
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                  {countMap.get(profile.id) ?? 0}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <Link
                    href={`/admin/users/${profile.id}`}
                    style={{ fontSize: '0.8125rem', color: 'var(--blue)', textDecoration: 'none' }}
                  >
                    View projects →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {(profiles ?? []).length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users yet.</div>
        )}
      </div>
    </div>
  )
}
