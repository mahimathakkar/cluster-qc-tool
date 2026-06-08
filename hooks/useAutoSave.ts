'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { saveProjectState } from '@/lib/project'
import type { PersistedQCState } from '@/lib/types'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(projectId: string, state: PersistedQCState, enabled: boolean) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const latestStateRef = useRef(state)

  latestStateRef.current = state

  const save = useCallback(async (s: PersistedQCState): Promise<boolean> => {
    setSaveStatus('saving')
    try {
      await saveProjectState(projectId, s)
      setSaveStatus('saved')
      retryCountRef.current = 0
      setTimeout(() => setSaveStatus('idle'), 2000)
      return true
    } catch {
      if (retryCountRef.current < 3) {
        retryCountRef.current++
        setSaveStatus('error')
        setTimeout(() => save(latestStateRef.current), 2000 * retryCountRef.current)
      } else {
        setSaveStatus('error')
      }
      return false
    }
  }, [projectId])

  // Debounced auto-save on state change
  useEffect(() => {
    if (!enabled) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(state), 1500)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [state, enabled, save])

  // Force save on page hide / unload
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timerRef.current) clearTimeout(timerRef.current)
        save(latestStateRef.current)
      }
    }

    const handleBeforeUnload = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      // Best-effort synchronous save via sendBeacon or just trigger save
      saveProjectState(projectId, latestStateRef.current).catch(() => {})
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, projectId, save])

  const forceSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    return save(latestStateRef.current)
  }, [save])

  return { saveStatus, forceSave }
}
