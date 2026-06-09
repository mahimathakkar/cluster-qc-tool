import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Project } from '@/lib/types'

const STEP_LABELS: Record<string, string> = {
  upload: 'Upload',
  ready: 'Ready',
  '1': 'Remove',
  '2': 'Merge',
  '3': 'Reassign',
  export: 'Export',
}

export const dynamic = 'force-dynamic'

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const db = createAdminClient()
  const { userId } = params

  const [{ data: profile }, { data: projects }] = await Promise.all([
    db.from('profiles').select('id, email, role, created_at').eq('id', userId).single(),
    db.from('projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
  ])

  if (!profile) notFound()

  const allProjects = (projects ?? []) as Project[]
  const active = allProjects.filter(p => p.status === 'active').length
  const completed = allProjects.filter(p => p.status === 'completed').length

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
      <Link href="/admin/users" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← All users
      </Link>

      <div style={{ marginTop: 16, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{profile.email}</h1>
          <span style={{
            padding: '2px 8px',
            borderRadius: 9999,
            fontSize: 12,
            fontWeight: 500,
            background: profile.role === 'admin' ? 'var(--purple-light)' : '#F1F5F9',
            color: profile.role === 'admin' ? '#5b21b6' : 'var(--text-muted)',
          }}>
            {profile.role}
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Member since {new Date(profile.created_at).toLocaleDateString()} · {allProjects.length} projects ({active} active, {completed} completed)
        </p>
      </div>

      <h2 style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Projects</h2>

      {allProjects.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No projects yet.
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Name', 'Status', 'Step', 'Created', 'Updated'].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allProjects.map((project, i) => (
                <tr
                  key={project.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: i % 2 === 1 ? '#FAFAFA' : 'var(--surface)',
                    height: 48,
                  }}
                >
                  <td style={{ padding: '0 16px', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.name}
                  </td>
                  <td style={{ padding: '0 16px' }}>
                    <StatusBadge status={project.status} />
                  </td>
                  <td style={{ padding: '0 16px', color: 'var(--text-muted)' }}>
                    {STEP_LABELS[project.current_step] ?? project.current_step}
                  </td>
                  <td style={{ padding: '0 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(project.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: 'var(--blue-light)', color: '#1d4ed8' },
    completed: { bg: 'var(--green-light)', color: '#15803d' },
    archived: { bg: '#F1F5F9', color: 'var(--text-muted)' },
  }
  const { bg, color } = map[status] ?? map.archived
  return (
    <span style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 500, background: bg, color }}>
      {status}
    </span>
  )
}
