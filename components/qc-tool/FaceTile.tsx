'use client'

import { useState } from 'react'
import FacePreview from './FacePreview'

interface FaceTileProps {
  filename: string
  imageUrl?: string
  selected: boolean
  onToggle: (filename: string) => void
}

export default function FaceTile({ filename, imageUrl, selected, onToggle }: FaceTileProps) {
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)

  function handleMouseMove(e: React.MouseEvent) {
    setHoverPos({ x: e.clientX, y: e.clientY })
  }

  function handleMouseLeave() {
    setHoverPos(null)
  }

  return (
    <>
      <div
        className={`face-tile${selected ? ' selected' : ''}`}
        onClick={() => onToggle(filename)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        title={filename}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={filename} loading="lazy" />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.625rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '0.25rem',
            wordBreak: 'break-all',
          }}>
            {filename.split('/').pop()}
          </div>
        )}
      </div>

      {hoverPos && imageUrl && (
        <FacePreview
          imageUrl={imageUrl}
          filename={filename}
          x={hoverPos.x}
          y={hoverPos.y}
        />
      )}
    </>
  )
}
