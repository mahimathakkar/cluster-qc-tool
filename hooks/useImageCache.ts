'use client'

import { useState, useCallback, useRef } from 'react'
import { getClusterStoragePaths, getSignedUrls } from '@/lib/storage'

export function useImageCache(projectId: string) {
  // filename -> signed URL
  const [urlCache, setUrlCache] = useState<Map<string, string>>(new Map())
  const loadingRef = useRef<Set<string>>(new Set())

  const loadClusterImages = useCallback(async (clusterId: string): Promise<void> => {
    if (loadingRef.current.has(clusterId)) return
    loadingRef.current.add(clusterId)

    try {
      const paths = await getClusterStoragePaths(projectId, clusterId)
      if (paths.length === 0) return

      const storagePaths = paths.map(p => p.storagePath)
      const urlMap = await getSignedUrls(storagePaths)

      setUrlCache(prev => {
        const next = new Map(prev)
        paths.forEach(({ filename, storagePath }) => {
          const url = urlMap.get(storagePath)
          if (url) next.set(filename, url)
        })
        return next
      })
    } finally {
      loadingRef.current.delete(clusterId)
    }
  }, [projectId])

  const getImageUrl = useCallback((filename: string): string | undefined => {
    return urlCache.get(filename)
  }, [urlCache])

  const preloadCluster = useCallback(async (clusterId: string) => {
    // Non-blocking background preload
    loadClusterImages(clusterId).catch(() => {})
  }, [loadClusterImages])

  return { loadClusterImages, getImageUrl, preloadCluster, urlCache }
}
