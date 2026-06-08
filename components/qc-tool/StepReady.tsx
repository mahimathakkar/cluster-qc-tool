'use client'

import type { ClusterState } from '@/lib/types'

interface StepReadyProps {
  clusters: ClusterState[]
  projectName: string
  onStart: () => void
}

export default function StepReady({ clusters, projectName, onStart }: StepReadyProps) {
  const totalFaces = clusters.reduce((sum, c) => sum + c.faces.length, 0)

  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Ready to review
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        <strong>{projectName}</strong> — {clusters.length} clusters, {totalFaces.toLocaleString()} faces uploaded.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{clusters.length}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Clusters</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{totalFaces.toLocaleString()}</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Total faces</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>4</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Steps</div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem', textAlign: 'left', marginBottom: '2rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9375rem' }}>What you&apos;ll do:</h3>
        <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Remove</strong> — Click faces that don&apos;t belong in each cluster.
          </li>
          <li style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Merge</strong> — Select duplicate clusters of the same person to combine.
          </li>
          <li style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Reassign</strong> — Decide where each removed face belongs.
          </li>
          <li style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Export</strong> — Download a CSV of all changes.
          </li>
        </ol>
      </div>

      <button className="btn btn-primary" onClick={onStart} style={{ padding: '0.75rem 2.5rem', fontSize: '1rem' }}>
        Start review →
      </button>
    </div>
  )
}
