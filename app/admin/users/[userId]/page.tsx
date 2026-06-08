import { createClient } from '@/lib/supabase/server'
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

export default async function AdminUserDetailPage({ params }: { params: { userId: string } }) {
  const supabase = createClient()
  const { userId } = params

  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase.from('profiles').select('id, email, role, created_at').eq('id', userId).single(),
    supabase.from('projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
  ])

  if (!profile) notFound()

  const allProjects = (projects ?? []) as Project[]
  const active = allProjects.filter(p => p.status === 'active').length
  const completed = allProjects.filter(p => p.status === 'completed').length

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/admin/users" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← All users
      </Link>

      <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>{profile.email}</h1>
          <span style={{
            padding: '0.125rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 500,
            background: profile.role === 'admin' ? 'var(--purple-light)' : '#f3f4f6',
            color: profile.role === 'admin' ? '#5b21b6' : '#374151',
          }}>
            {profile.role}
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Member since {new Date(profile.created_at).toLocaleDateString()} · {allProjects.length} projects ({active} active, {completed} completed)
        </p>
      </div>

      <h2 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.75rem' }}>Projects (read-only)</h2>

      {allProjects.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No projects yet.
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Name', 'Status', 'Step', 'Created', 'Updated'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allProjects.map(project => (
                <tr key={project.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {project.name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <StatusBadge status={project.status} />
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {STEP_LABELS[project.current_step] ?? project.current_step}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
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
    archived: { bg: '#f3f4f6', color: '#374151' },
  }
  const { bg, color } = map[status] ?? map.archived
  return (
    <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: bg, color }}>
      {status}
    </span>
  )
}
