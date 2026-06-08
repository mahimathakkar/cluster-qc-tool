'use client'

import Link from 'next/link'
import type { Project, ProjectStep } from '@/lib/types'
import { archiveProject } from '@/lib/project'
import { useRouter } from 'next/navigation'

const STEP_LABELS: Record<ProjectStep, string> = {
  upload: 'Upload',
  ready: 'Ready',
  '1': 'Remove',
  '2': 'Merge',
  '3': 'Reassign',
  export: 'Export',
}

const STEP_ORDER: ProjectStep[] = ['upload', 'ready', '1', '2', '3', 'export']

interface ProjectCardProps {
  project: Project
  onArchived?: () => void
}

export default function ProjectCard({ project, onArchived }: ProjectCardProps) {
  const router = useRouter()
  const stepIdx = STEP_ORDER.indexOf(project.current_step)
  const progress = Math.round((stepIdx / (STEP_ORDER.length - 1)) * 100)

  async function handleArchive(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm('Archive this project?')) return
    await archiveProject(project.id)
    onArchived?.()
    router.refresh()
  }

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: 600, fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.name}
          </h3>
          {project.description && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.description}
            </p>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>

      {/* Step progress */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Step: {STEP_LABELS[project.current_step]}</span>
          <span style={{ fontWeight: 600 }}>{progress}%</span>
        </div>
        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '9999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: project.status === 'completed' ? 'var(--green)' : 'var(--blue)', borderRadius: '9999px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Dates */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Updated {formatDate(project.updated_at)} · Created {formatDate(project.created_at)}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem', borderTop: '1px solid var(--border)' }}>
        {project.status === 'archived' ? (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Archived</span>
        ) : project.status === 'completed' ? (
          <Link href={`/projects/${project.id}?step=export`} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}>
            View export
          </Link>
        ) : (
          <Link href={`/projects/${project.id}`} className="btn btn-primary" style={{ fontSize: '0.8125rem' }}>
            Continue →
          </Link>
        )}
        {project.status === 'active' && (
          <button
            className="btn btn-secondary"
            onClick={handleArchive}
            style={{ fontSize: '0.8125rem', marginLeft: 'auto', color: 'var(--text-muted)' }}
          >
            Archive
          </button>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Project['status'] }) {
  const map = {
    active: { cls: 'badge-blue', label: 'Active' },
    completed: { cls: 'badge-green', label: 'Completed' },
    archived: { cls: 'badge-gray', label: 'Archived' },
  }
  const { cls, label } = map[status]
  return <span className={`badge ${cls}`}>{label}</span>
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}
