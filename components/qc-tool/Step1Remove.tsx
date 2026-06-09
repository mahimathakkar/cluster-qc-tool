'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import type { ClusterState } from '@/lib/types'
import FaceTile from './FaceTile'

const PAGE_SIZE = 120

type TileSize = 'small' | 'medium' | 'large'
const SIZE_PX: Record<TileSize, number> = { small: 120, medium: 180, large: 260 }
const LS_KEY = 'qc-tile-size'

function readStoredSize(): TileSize {
  if (typeof window === 'undefined') return 'medium'
  const v = localStorage.getItem(LS_KEY)
  if (v === 'small' || v === 'medium' || v === 'large') return v
  return 'medium'
}

interface Step1Props {
  clusters: ClusterState[]
  activeClusters: ClusterState[]
  currentClusterIndex: number
  currentCluster: ClusterState | null
  pendingRemovals: Set<string>
  getImageUrl: (filename: string) => string | undefined
  getFullImageUrl: (filename: string) => string | undefined
  onToggleFace: (filename: string) => void
  onClearRemovals: () => void
  onRemoveSelected: () => void
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
  getFullImageUrl,
  onToggleFace,
  onClearRemovals,
  onRemoveSelected,
  onConfirmCluster,
  onGoBack,
  onLoadImages,
  onPreloadImages,
}: Step1Props) {
  const [tileSize, setTileSize] = useState<TileSize>('medium')
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    setTileSize(readStoredSize())
  }, [])

  function pickSize(s: TileSize) {
    setTileSize(s)
    localStorage.setItem(LS_KEY, s)
  }

  useEffect(() => {
    setCurrentPage(0)
  }, [currentCluster?.id])

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
      <div style={{ maxWidth: 500, margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
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
  const totalPages = Math.ceil(faces.length / PAGE_SIZE)
  const hasPagination = faces.length > PAGE_SIZE
  const pagedFaces = faces.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
  const showingFrom = currentPage * PAGE_SIZE + 1
  const showingTo = Math.min((currentPage + 1) * PAGE_SIZE, faces.length)

  return (
    <>
      {/* ── Sticky sub-header: cluster info + controls ── */}
      <div className="sticky-action-bar" style={{ justifyContent: 'space-between' }}>
        {/* Left: cluster info */}
        <div>
          <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>
            Cluster {currentClusterIndex + 1} of {activeClusters.length}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
            · {currentCluster.id}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 8 }}>
            · {faces.length} {faces.length === 1 ? 'face' : 'faces'}
          </span>
          {pendingRemovals.size > 0 && (
            <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600, marginLeft: 8 }}>
              · {pendingRemovals.size} selected
            </span>
          )}
        </div>

        {/* Right: S/M/L toggle + keyboard hint */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>→ next · ← back · X clear</span>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            {(['small', 'medium', 'large'] as TileSize[]).map((s, i) => (
              <button
                key={s}
                onClick={() => pickSize(s)}
                style={{
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: 600,
                  background: tileSize === s ? 'var(--text)' : 'var(--surface)',
                  color: tileSize === s ? '#fff' : 'var(--text-muted)',
                  border: 'none',
                  borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {s === 'small' ? 'S' : s === 'medium' ? 'M' : 'L'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ padding: '16px 20px', maxWidth: 1400, margin: '0 auto', paddingBottom: 88 }}>
        {/* Top pagination bar */}
        {hasPagination && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: 'var(--text-muted)' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              ← Prev
            </button>
            <span>Showing {showingFrom}–{showingTo} of {faces.length}</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next →
            </button>
            <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 10px' }}>
              Page {currentPage + 1} of {totalPages}
            </span>
          </div>
        )}

        {/* Face grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${SIZE_PX[tileSize]}px, 1fr))`,
          gap: 8,
          borderRadius: 8,
        }}>
          {pagedFaces.map(face => (
            <FaceTile
              key={face.filename}
              filename={face.filename}
              imageUrl={getImageUrl(face.filename)}
              fallbackUrl={getFullImageUrl(face.filename)}
              selected={pendingRemovals.has(face.filename)}
              onToggle={onToggleFace}
            />
          ))}
        </div>

        {/* Bottom pagination bar */}
        {hasPagination && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginTop: 20,
            padding: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            fontSize: 14,
          }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              ← Prev
            </button>
            <span style={{ color: 'var(--text-muted)' }}>
              Page <strong style={{ color: 'var(--text)' }}>{currentPage + 1}</strong> of{' '}
              <strong style={{ color: 'var(--text)' }}>{totalPages}</strong>
              &nbsp;·&nbsp;{showingFrom}–{showingTo} of {faces.length} faces
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── Sticky bottom action bar ── */}
      <div className="bottom-action-bar">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onGoBack}
          disabled={currentClusterIndex === 0}
        >
          ← Back
        </button>
        {pendingRemovals.size > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={onClearRemovals}>
            Clear
          </button>
        )}
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-red"
          onClick={onRemoveSelected}
          disabled={pendingRemovals.size === 0}
        >
          {pendingRemovals.size > 0 ? `Remove ${pendingRemovals.size} selected` : 'Remove selected'}
        </button>
        <button className="btn btn-primary" onClick={onConfirmCluster}>
          Done with cluster →
        </button>
      </div>
    </>
  )
}
