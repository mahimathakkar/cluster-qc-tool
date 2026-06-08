'use client'

import { useEffect, useCallback, useRef } from 'react'
import type { ClusterState } from '@/lib/types'
import FaceTile from './FaceTile'

const PAGE_SIZE = 120

interface Step1Props {
  clusters: ClusterState[]
  activeClusters: ClusterState[]
  currentClusterIndex: number
  currentCluster: ClusterState | null
  pendingRemovals: Set<string>
  getImageUrl: (filename: string) => string | undefined
  onToggleFace: (filename: string) => void
  onClearRemovals: () => void
  onConfirmCluster: () => void
  onGoBack: () => void
  onLoadImages: (clusterId: string) => Promise<void>
  onPreloadImages: (clusterId: string) => void
}

export default function Step1Remove({
  activeClusters,
  currentClusterIndex,
  currentCluster,
  pendingRemovals,
  getImageUrl,
  onToggleFace,
  onClearRemovals,
  onConfirmCluster,
  onGoBack,
  onLoadImages,
  onPreloadImages,
}: Step1Props) {
  // Use refs to keep callbacks stable in effects
  const loadRef = useRef(onLoadImages)
  const preloadRef = useRef(onPreloadImages)
  loadRef.current = onLoadImages
  preloadRef.current = onPreloadImages

  const clustersRef = useRef(activeClusters)
  const idxRef = useRef(currentClusterIndex)
  clustersRef.current = activeClusters
  idxRef.current = currentClusterIndex

  useEffect(() => {
    if (!currentCluster) return
    loadRef.current(currentCluster.id)
    const nextCluster = clustersRef.current[idxRef.current + 1]
    if (nextCluster) preloadRef.current(nextCluster.id)
  // Only re-run when we move to a new cluster
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCluster?.id])

  const confirmRef = useRef(onConfirmCluster)
  const backRef = useRef(onGoBack)
  const clearRef = useRef(onClearRemovals)
  confirmRef.current = onConfirmCluster
  backRef.current = onGoBack
  clearRef.current = onClearRemovals

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
    if (e.key === 'ArrowRight') confirmRef.current()
    if (e.key === 'ArrowLeft') backRef.current()
    if (e.key === 'x' || e.key === 'X') clearRef.current()
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!currentCluster) {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>All clusters reviewed!</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {pendingRemovals.size > 0
            ? `${pendingRemovals.size} face(s) still selected. Confirm them before continuing.`
            : 'Proceed to the merge step.'}
        </p>
        <button className="btn btn-primary" onClick={onConfirmCluster} style={{ padding: '0.75rem 2rem' }}>
          Continue to Merge →
        </button>
      </div>
    )
  }

  const faces = currentCluster.faces
  const pagedFaces = faces.slice(0, PAGE_SIZE)
  const hasMore = faces.length > PAGE_SIZE

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>
            Cluster {currentClusterIndex + 1} of {activeClusters.length}
            <span style={{ marginLeft: '0.5rem', fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
              · {currentCluster.id}
            </span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.125rem' }}>
            {faces.length} {faces.length === 1 ? 'face' : 'faces'}
            {pendingRemovals.size > 0 && (
              <span style={{ color: 'var(--red)', fontWeight: 600 }}>
                {' '}· {pendingRemovals.size} selected for removal
              </span>
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>→ next · ← back · X clear</span>
          {pendingRemovals.size > 0 && (
            <button className="btn btn-secondary" onClick={onClearRemovals} style={{ fontSize: '0.8125rem' }}>
              Clear
            </button>
          )}
          <button className="btn btn-secondary" onClick={onGoBack} disabled={currentClusterIndex === 0} style={{ fontSize: '0.8125rem' }}>
            ← Back
          </button>
          <button className="btn btn-primary" onClick={onConfirmCluster} style={{ fontSize: '0.8125rem' }}>
            {pendingRemovals.size > 0 ? `Remove ${pendingRemovals.size} & next →` : 'Looks correct →'}
          </button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
        gap: '6px',
      }}>
        {pagedFaces.map(face => (
          <FaceTile
            key={face.filename}
            filename={face.filename}
            imageUrl={getImageUrl(face.filename)}
            selected={pendingRemovals.has(face.filename)}
            onToggle={onToggleFace}
          />
        ))}
      </div>

      {hasMore && (
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
          Showing first {PAGE_SIZE} of {faces.length} faces
        </p>
      )}
    </div>
  )
}
