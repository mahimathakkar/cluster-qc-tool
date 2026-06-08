'use client'

import { useState } from 'react'
import type { ClusterState } from '@/lib/types'
import FaceTile from './FaceTile'

interface ClusterCardProps {
  cluster: ClusterState
  selected: boolean
  getImageUrl: (filename: string) => string | undefined
  onSelect: (id: string) => void
  onLoadImages?: (id: string) => void
  compact?: boolean
}

export default function ClusterCard({
  cluster,
  selected,
  getImageUrl,
  onSelect,
  onLoadImages,
  compact = false,
}: ClusterCardProps) {
  const [expanded, setExpanded] = useState(false)
  const previews = cluster.faces.slice(0, 3)

  function handleExpand(e: React.MouseEvent) {
    e.stopPropagation()
    if (!expanded && onLoadImages) onLoadImages(cluster.id)
    setExpanded(v => !v)
  }

  return (
    <div
      className={`cluster-card${selected ? ' selected' : ''}`}
      onClick={() => onSelect(cluster.id)}
      style={{ userSelect: 'none' }}
    >
      {/* Preview thumbnails */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
        {previews.map(face => (
          <div key={face.filename} style={{ aspectRatio: '1', overflow: 'hidden', background: '#f3f4f6' }}>
            {getImageUrl(face.filename) ? (
              <img
                src={getImageUrl(face.filename)}
                alt={face.filename}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: '#e5e7eb' }} />
            )}
          </div>
        ))}
        {previews.length < 3 && Array.from({ length: 3 - previews.length }).map((_, i) => (
          <div key={i} style={{ aspectRatio: '1', background: '#f3f4f6' }} />
        ))}
      </div>

      {/* Info */}
      <div style={{ padding: '0.625rem 0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cluster.id}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {cluster.faces.length} {cluster.faces.length === 1 ? 'face' : 'faces'}
            </div>
          </div>
          {selected && (
            <div style={{
              width: '1.25rem',
              height: '1.25rem',
              borderRadius: '9999px',
              background: 'var(--amber)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              flexShrink: 0,
            }}>
              ✓
            </div>
          )}
        </div>

        {!compact && (
          <button
            className="btn btn-secondary"
            onClick={handleExpand}
            style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
          >
            {expanded ? 'Hide faces ▲' : 'View all faces ▼'}
          </button>
        )}
      </div>

      {/* Expanded face grid */}
      {expanded && (
        <div
          style={{ padding: '0.5rem 0.75rem 0.75rem', borderTop: '1px solid var(--border)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
            gap: '4px',
            maxHeight: '240px',
            overflowY: 'auto',
          }}>
            {cluster.faces.map(face => (
              <FaceTile
                key={face.filename}
                filename={face.filename}
                imageUrl={getImageUrl(face.filename)}
                selected={false}
                onToggle={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
