'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Project, ProjectStep } from '@/lib/types'
import { archiveProject } from '@/lib/project'
import { useRouter } from 'next/navigation'

const STEP_LABELS: Record<ProjectStep, string> = {
  upload: 'Uploading',
  ready: 'Ready',
  '1': 'Remove',
  '2': 'Merge',
  '3': 'Reassign',
  export: 'Export',
}

const PROJECT_COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B',
  '#10B981', '#3B82F6', '#EF4444', '#F97316',
]

function colorForName(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  return PROJECT_COLORS[Math.abs(h) % PROJECT_COLORS.length]
}

export default function ProjectCard({ project }: { project: Project }) {
  const router = useRouter()
  const [archiving, setArchiving] = useState(false)
  const [hovered, setHovered] = useState(false)
  const bg = colorForName(project.name)

  async function handleArchive(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Archive this project?')) return
    setArchiving(true)
    await archiveProject(project.id)
    router.refresh()
  }

  const href = project.status === 'completed'
    ? `/projects/${project.id}?step=export`
    : project.status === 'archived'
    ? '#'
    : `/projects/${project.id}`

  return (
    <div
      className="project-row"
      style={{ background: hovered ? 'var(--bg)' : 'var(--surface)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Color icon */}
      <div className="project-icon" style={{ background: bg }}>
        {project.name.charAt(0).toUpperCase()}
      </div>

      {/* Name + description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {project.name}
        </div>
        {project.description && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.description}
          </div>
        )}
      </div>

      {/* Right side: step | badge | date | action — 24px gap */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {STEP_LABELS[project.current_step]}
        </span>
        <StatusBadge status={project.status} />
        <span style={{ fontSize: 12, color: 'var(--text-subtle)', whiteSpace: 'nowrap', minWidth: 72, textAlign: 'right' }}>
          {formatDate(project.updated_at)}
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, marginLeft: 8 }}>
        {project.status === 'active' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleArchive}
            disabled={archiving}
            style={{ color: 'var(--text-subtle)' }}
          >
            {archiving ? '…' : 'Archive'}
          </button>
        )}
        {project.status !== 'archived' && (
          <Link
            href={href}
            className={`btn btn-sm ${project.status === 'active' ? 'btn-primary' : 'btn-secondary'}`}
          >
            {project.status === 'completed' ? 'View' : 'Open'}
          </Link>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: Project['status'] }) {
  const map = {
    active: { cls: 'badge-accent', label: 'Active' },
    completed: { cls: 'badge-green', label: 'Done' },
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
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
