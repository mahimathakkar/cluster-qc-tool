'use client'

import { useState, useEffect, useRef } from 'react'
import FacePreview from './FacePreview'

interface FaceTileProps {
  filename: string
  imageUrl?: string      // thumbnail URL (preferred for grid)
  fallbackUrl?: string   // full URL used if thumbnail fails / for preview
  selected: boolean
  onToggle: (filename: string) => void
}

export default function FaceTile({ filename, imageUrl, fallbackUrl, selected, onToggle }: FaceTileProps) {
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [src, setSrc] = useState<string | undefined>(imageUrl)
  const tileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = tileRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setIsVisible(true); observer.disconnect() }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setSrc(imageUrl)
    setImgLoaded(false)
  }, [imageUrl])

  function handleError() {
    // If thumbnail failed, try the full URL
    if (fallbackUrl && src !== fallbackUrl) {
      setSrc(fallbackUrl)
      setImgLoaded(false)
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    setHoverPos({ x: e.clientX, y: e.clientY })
  }

  function handleMouseLeave() {
    setHoverPos(null)
  }

  const showSkeleton = !isVisible || !src || !imgLoaded
  const previewUrl = fallbackUrl || src

  return (
    <>
      <div
        ref={tileRef}
        className={`face-tile${selected ? ' selected' : ''}`}
        onClick={() => onToggle(filename)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        title={filename}
      >
        {showSkeleton && (
          <div className="skeleton-pulse" style={{ width: '100%', height: '100%' }} />
        )}
        {isVisible && src && (
          <img
            src={src}
            alt={filename}
            style={{ display: imgLoaded ? 'block' : 'none' }}
            onLoad={() => setImgLoaded(true)}
            onError={handleError}
          />
        )}
      </div>

      {hoverPos && previewUrl && imgLoaded && (
        <FacePreview
          imageUrl={previewUrl}
          filename={filename}
          x={hoverPos.x}
          y={hoverPos.y}
        />
      )}
    </>
  )
}
