import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const db = createAdminClient()

  const [{ data: profiles }, { data: projectCounts }] = await Promise.all([
    db.from('profiles').select('id, email, role, created_at').order('created_at', { ascending: false }),
    db.from('projects').select('user_id'),
  ])

  const countMap = new Map<string, number>()
  for (const p of projectCounts ?? []) {
    countMap.set(p.user_id, (countMap.get(p.user_id) ?? 0) + 1)
  }

  const TH: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border)',
    whiteSpace: 'nowrap',
  }

  return (
    <div className="page-fade" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Users</h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        {profiles?.length ?? 0} registered account{(profiles?.length ?? 0) !== 1 ? 's' : ''}
      </p>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: 'var(--bg)' }}>
              <th style={TH}>Email</th>
              <th style={TH}>Role</th>
              <th style={TH}>Projects</th>
              <th style={TH}>Joined</th>
              <th style={{ ...TH, textAlign: 'right' }}></th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((profile, i) => (
              <tr
                key={profile.id}
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: i % 2 === 1 ? '#FAFAFA' : 'var(--surface)',
                  height: 48,
                }}
              >
                <td style={{ padding: '0 16px', fontWeight: 500 }}>{profile.email}</td>
                <td style={{ padding: '0 16px' }}>
                  <span
                    className="badge"
                    style={{
                      background: profile.role === 'admin' ? 'var(--purple-light)' : '#F1F5F9',
                      color: profile.role === 'admin' ? '#5b21b6' : 'var(--text-muted)',
                    }}
                  >
                    {profile.role}
                  </span>
                </td>
                <td style={{ padding: '0 16px', color: 'var(--text-muted)' }}>
                  {countMap.get(profile.id) ?? 0}
                </td>
                <td style={{ padding: '0 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '0 16px', textAlign: 'right' }}>
                  <Link
                    href={`/admin/users/${profile.id}`}
                    style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    View →
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
