'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getProject, getProjectState, updateProjectStep } from '@/lib/project'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import QCContent from './QCContent'
import type { Project, PersistedQCState } from '@/lib/types'

export default function ProjectPage() {
  return (
    <ToastProvider>
      <ProjectLoader />
    </ToastProvider>
  )
}

function ProjectLoader() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { showToast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [initialState, setInitialState] = useState<PersistedQCState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const [proj, state] = await Promise.all([getProject(id), getProjectState(id)])
      if (!mounted) return

      if (!proj) {
        showToast('Project not found', 'error')
        router.push('/dashboard')
        return
      }

      setProject(proj)
      setInitialState(state ?? {
        clusters: [],
        removed: [],
        discarded: [],
        currentClusterIndex: 0,
        currentRemovedIndex: 0,
        newClusterCounter: 0,
      })
      setLoading(false)
    }

    load()
    return () => { mounted = false }
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <LoadingSpinner size={32} />
        <p style={{ color: 'var(--text-muted)' }}>Restoring your session…</p>
      </div>
    )
  }

  if (!project || !initialState) return null

  return (
    <QCContent
      project={project}
      initialState={initialState}
      onStepChange={(step) => updateProjectStep(id, step)}
    />
  )
}
