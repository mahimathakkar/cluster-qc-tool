'use client'

import { useState, useEffect } from 'react'
import type { ClusterState, RemovedFace } from '@/lib/types'
import ClusterCard from './ClusterCard'

interface Step3Props {
  activeClusters: ClusterState[]
  removed: RemovedFace[]
  currentRemovedIndex: number
  currentRemovedFace: RemovedFace | null
  getImageUrl: (filename: string) => string | undefined
  onAssign: (filename: string, clusterId: string) => void
  onCreateNew: (filename: string) => void
  onDiscard: (filename: string) => void
  onGoBack: () => void
  onContinue: () => void
  onLoadImages: (clusterId: string) => Promise<void>
}

export default function Step3Reassign({
  activeClusters,
  removed,
  currentRemovedIndex,
  currentRemovedFace,
  getImageUrl,
  onAssign,
  onCreateNew,
  onDiscard,
  onGoBack,
  onContinue,
  onLoadImages,
}: Step3Props) {
  const [search, setSearch] = useState('')
  const pendingFaces = removed.filter(f => !f.isDiscarded && !f.assignedTo)

  // Load image for current face
  useEffect(() => {
    if (!currentRemovedFace) return
    onLoadImages(currentRemovedFace.sourceCluster)
  }, [currentRemovedFace?.filename])

  if (!currentRemovedFace) {
    // All faces processed
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>All faces reassigned!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          You&apos;ve handled all {removed.length} removed face(s). Proceed to export.
        </p>
        <button className="btn btn-primary" onClick={onContinue} style={{ padding: '0.75rem 2rem' }}>
          Continue to Export →
        </button>
      </div>
    )
  }

  const filteredClusters = activeClusters.filter(c =>
    search ? c.id.toLowerCase().includes(search.toLowerCase()) : true
  )

  const faceUrl = getImageUrl(currentRemovedFace.filename)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
      {/* Main panel */}
      <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Reassign removed faces</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.125rem' }}>
              Face {currentRemovedIndex + 1} of {pendingFaces.length + currentRemovedIndex}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-secondary" onClick={onGoBack} disabled={currentRemovedIndex === 0} style={{ fontSize: '0.8125rem' }}>
              ← Back
            </button>
          </div>
        </div>

        {/* Current face */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ width: '160px', flexShrink: 0 }}>
            {faceUrl ? (
              <img
                src={faceUrl}
                alt={currentRemovedFace.filename}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
              />
            ) : (
              <div style={{ width: '100%', aspectRatio: '1', background: '#f3f4f6', borderRadius: '8px' }} />
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem', wordBreak: 'break-all' }}>
              {currentRemovedFace.filename}
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Originally from cluster: <strong>{currentRemovedFace.sourceCluster}</strong>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-green"
                onClick={() => onCreateNew(currentRemovedFace.filename)}
                style={{ fontSize: '0.8125rem' }}
              >
                + Create new cluster
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => onDiscard(currentRemovedFace.filename)}
                style={{ fontSize: '0.8125rem', color: 'var(--red)', borderColor: 'var(--red-light)' }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
          Or assign to an existing cluster:
        </p>
        <input
          className="input"
          placeholder="Search clusters…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: '0.75rem' }}
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '0.5rem',
        }}>
          {filteredClusters.map(cluster => (
            <div key={cluster.id} style={{ cursor: 'pointer' }} onClick={() => onAssign(currentRemovedFace.filename, cluster.id)}>
              <ClusterCard
                cluster={cluster}
                selected={false}
                getImageUrl={getImageUrl}
                onSelect={() => onAssign(currentRemovedFace.filename, cluster.id)}
                onLoadImages={onLoadImages}
                compact
              />
            </div>
          ))}
        </div>
      </div>

      {/* Side panel: progress */}
      <div style={{ borderLeft: '1px solid var(--border)', padding: '1.25rem', overflowY: 'auto', background: 'var(--bg)' }}>
        <h3 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>Removed faces</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {removed.map((face, idx) => {
            const isCurrent = face.filename === currentRemovedFace.filename
            const isDone = face.isDiscarded || face.assignedTo
            return (
              <div
                key={face.filename}
                style={{
                  padding: '0.5rem 0.625rem',
                  borderRadius: '6px',
                  background: isCurrent ? 'var(--blue-light)' : isDone ? 'var(--green-light)' : 'var(--surface)',
                  border: '1px solid ' + (isCurrent ? 'var(--blue)' : isDone ? 'var(--green)' : 'var(--border)'),
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {face.filename.split('/').pop()}
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '0.125rem' }}>
                  {face.isDiscarded ? '🗑 Discarded' : face.assignedTo ? `→ ${face.assignedTo}` : 'Pending'}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
