'use client'

import { useState, useCallback, useRef } from 'react'
import { getClusterStoragePaths, getSignedUrls } from '@/lib/storage'

type UrlEntry = { full?: string; thumb?: string }

export function useImageCache(projectId: string) {
  const [urlCache, setUrlCache] = useState<Map<string, UrlEntry>>(new Map())
  const loadingRef = useRef<Set<string>>(new Set())

  const loadClusterImages = useCallback(async (clusterId: string): Promise<void> => {
    if (loadingRef.current.has(clusterId)) return
    loadingRef.current.add(clusterId)

    try {
      const paths = await getClusterStoragePaths(projectId, clusterId)
      if (paths.length === 0) return

      // Fetch full + thumbnail signed URLs in one batch call
      const allPaths = [
        ...paths.map(p => p.storagePath),
        ...paths.map(p => p.thumbnailPath),
      ]
      const urlMap = await getSignedUrls(allPaths)

      setUrlCache(prev => {
        const next = new Map(prev)
        paths.forEach(({ filename, storagePath, thumbnailPath }) => {
          next.set(filename, {
            full: urlMap.get(storagePath),
            thumb: urlMap.get(thumbnailPath),
          })
        })
        return next
      })
    } finally {
      loadingRef.current.delete(clusterId)
    }
  }, [projectId])

  // Returns thumbnail URL if available, falls back to full URL
  const getImageUrl = useCallback((filename: string): string | undefined => {
    const entry = urlCache.get(filename)
    return entry?.thumb || entry?.full
  }, [urlCache])

  // Returns full-resolution URL
  const getFullImageUrl = useCallback((filename: string): string | undefined => {
    return urlCache.get(filename)?.full
  }, [urlCache])

  const preloadCluster = useCallback(async (clusterId: string) => {
    loadClusterImages(clusterId).catch(() => {})
  }, [loadClusterImages])

  return { loadClusterImages, getImageUrl, getFullImageUrl, preloadCluster, urlCache }
}
