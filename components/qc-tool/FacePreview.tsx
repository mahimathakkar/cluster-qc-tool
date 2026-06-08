'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface FacePreviewProps {
  imageUrl: string
  filename: string
  x: number
  y: number
}

export default function FacePreview({ imageUrl, filename, x, y }: FacePreviewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const SIZE = 200
  const OFFSET = 16

  // Adjust position to stay within viewport
  const vpW = window.innerWidth
  const vpH = window.innerHeight
  let left = x + OFFSET
  let top = y + OFFSET

  if (left + SIZE > vpW - 8) left = x - SIZE - OFFSET
  if (top + SIZE + 28 > vpH - 8) top = y - SIZE - 28 - OFFSET

  const portal = createPortal(
    <div style={{
      position: 'fixed',
      left,
      top,
      width: SIZE,
      zIndex: 10000,
      pointerEvents: 'none',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      border: '2px solid #fff',
      background: '#000',
    }}>
      <img
        src={imageUrl}
        alt={filename}
        style={{ width: '100%', height: SIZE, objectFit: 'cover', display: 'block' }}
      />
      <div style={{
        padding: '0.25rem 0.5rem',
        background: 'rgba(0,0,0,0.75)',
        color: '#fff',
        fontSize: '0.625rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {filename}
      </div>
    </div>,
    document.body
  )

  return portal
}
