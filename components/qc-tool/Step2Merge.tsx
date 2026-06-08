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
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem' }}>Merge duplicate clusters</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.125rem' }}>
            Select 2+ clusters that belong to the same person. The lowest ID absorbs the others.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {selectedClusters.size > 0 && (
            <button className="btn btn-secondary" onClick={onClearSelections} style={{ fontSize: '0.8125rem' }}>
              Clear
            </button>
          )}
          {canMerge && (
            <button className="btn btn-amber" onClick={onMerge} style={{ fontSize: '0.8125rem' }}>
              Merge {selectedClusters.size} → {targetCluster}
            </button>
          )}
          <button className="btn btn-primary" onClick={onContinue} style={{ fontSize: '0.8125rem' }}>
            Done with merges →
          </button>
        </div>
      </div>

      {/* Selected info */}
      {selectedClusters.size > 0 && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'var(--amber-light)',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 600 }}>{selectedClusters.size} clusters selected</span>
          {canMerge && (
            <span style={{ color: '#92400e' }}>
              → Will merge into <strong>{targetCluster}</strong>
            </span>
          )}
          {!canMerge && <span style={{ color: '#92400e' }}>Select one more to enable merge</span>}
        </div>
      )}

      {/* Cluster grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '0.75rem',
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
  )
}
