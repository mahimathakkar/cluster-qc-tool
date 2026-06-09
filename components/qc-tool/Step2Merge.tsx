'use client'

import type { ClusterState } from '@/lib/types'
import ClusterCard from './ClusterCard'

interface Step2Props {
  activeClusters: ClusterState[]
  selectedClusters: Set<string>
  getImageUrl: (filename: string) => string | undefined
  onToggleCluster: (id: string) => void
  onMerge: () => void
  onClearSelections: () => void
  onContinue: () => void
  onLoadImages: (clusterId: string) => Promise<void>
}

export default function Step2Merge({
  activeClusters,
  selectedClusters,
  getImageUrl,
  onToggleCluster,
  onMerge,
  onClearSelections,
  onContinue,
  onLoadImages,
}: Step2Props) {
  const selectedArr = Array.from(selectedClusters).sort()
  const targetCluster = selectedArr[0]
  const canMerge = selectedClusters.size >= 2

  return (
    <>
      {/* ── Sticky action bar below main header ── */}
      <div className="sticky-action-bar" style={{ justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Merge duplicate clusters</span>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 10 }}>
            Select 2+ that belong to the same person
          </span>
          {selectedClusters.size > 0 && (
            <span style={{ fontSize: 13, marginLeft: 10 }}>
              <span style={{ fontWeight: 600, color: 'var(--amber)' }}>{selectedClusters.size} selected</span>
              {canMerge && (
                <span style={{ color: 'var(--text-muted)' }}> → merges into <strong>{targetCluster}</strong></span>
              )}
              {!canMerge && (
                <span style={{ color: 'var(--text-muted)' }}> — select one more</span>
              )}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selectedClusters.size > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={onClearSelections}>
              Clear
            </button>
          )}
          {canMerge && (
            <button className="btn btn-amber btn-sm" onClick={onMerge}>
              Merge {selectedClusters.size} → {targetCluster}
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={onContinue}>
            Done with merges →
          </button>
        </div>
      </div>

      {/* ── Cluster grid ── */}
      <div style={{ padding: 20, maxWidth: 1400, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {activeClusters.map(cluster => (
            <ClusterCard
              key={cluster.id}
              cluster={cluster}
              selected={selectedClusters.has(cluster.id)}
              getImageUrl={getImageUrl}
              onSelect={onToggleCluster}
              onLoadImages={onLoadImages}
            />
          ))}
        </div>

        {activeClusters.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
            No clusters to display.
          </div>
        )}
      </div>
    </>
  )
}
