'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQCState } from '@/hooks/useQCState'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useImageCache } from '@/hooks/useImageCache'
import { useToast } from '@/components/ui/Toast'
import Header from '@/components/qc-tool/Header'
import StepReady from '@/components/qc-tool/StepReady'
import Step1Remove from '@/components/qc-tool/Step1Remove'
import Step2Merge from '@/components/qc-tool/Step2Merge'
import Step3Reassign from '@/components/qc-tool/Step3Reassign'
import StepExport from '@/components/qc-tool/StepExport'
import type { Project, PersistedQCState, ProjectStep } from '@/lib/types'

interface QCContentProps {
  project: Project
  initialState: PersistedQCState
  onStepChange: (step: ProjectStep) => Promise<void>
}

export default function QCContent({ project, initialState, onStepChange }: QCContentProps) {
  const router = useRouter()
  const { showToast } = useToast()
  const [currentStep, setCurrentStep] = useState<ProjectStep>(project.current_step as ProjectStep)
  const [transitioning, setTransitioning] = useState(false)
  const [backLoading, setBackLoading] = useState(false)

  const handleStateChange = useCallback((_s: PersistedQCState) => {}, [])
  const qc = useQCState(initialState, handleStateChange)

  const persistedState: PersistedQCState = {
    clusters: qc.clusters,
    removed: qc.removed,
    discarded: qc.discarded,
    currentClusterIndex: qc.currentClusterIndex,
    currentRemovedIndex: qc.currentRemovedIndex,
    newClusterCounter: qc.newClusterCounter,
  }

  const { saveStatus, forceSave } = useAutoSave(project.id, persistedState, true)
  const { loadClusterImages, getImageUrl, getFullImageUrl, preloadCluster } = useImageCache(project.id)

  async function navigateStep(step: ProjectStep) {
    setTransitioning(true)
    setCurrentStep(step)
    try {
      await onStepChange(step)
    } catch {
      showToast('Failed to save step progress', 'error')
    } finally {
      setTransitioning(false)
    }
  }

  async function handleBack() {
    setBackLoading(true)
    await forceSave()
    router.push('/dashboard')
    router.refresh()
  }

  function handleStep1Confirm() {
    qc.confirmClusterReview()
    const nextIdx = qc.currentClusterIndex + 1
    if (nextIdx >= qc.activeClusters.length) {
      navigateStep('2')
    }
  }

  function handleStep3Continue() {
    navigateStep('export')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header
        projectName={project.name}
        projectId={project.id}
        currentStep={currentStep}
        saveStatus={saveStatus}
        backLoading={backLoading}
        onBack={handleBack}
      />

      {transitioning && (
        <div className="step-overlay">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div className="spinner" style={{ width: 28, height: 28 }} />
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Loading…</span>
          </div>
        </div>
      )}

      {currentStep === 'upload' && (
        <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>Images are still processing. Please wait or refresh.</p>
        </div>
      )}

      {currentStep === 'ready' && (
        <StepReady
          clusters={qc.activeClusters}
          projectName={project.name}
          onStart={() => navigateStep('1')}
        />
      )}

      {currentStep === '1' && (
        <Step1Remove
          clusters={qc.clusters}
          activeClusters={qc.activeClusters}
          currentClusterIndex={qc.currentClusterIndex}
          currentCluster={qc.currentCluster}
          pendingRemovals={qc.pendingRemovals}
          getImageUrl={getImageUrl}
          getFullImageUrl={getFullImageUrl}
          onToggleFace={qc.toggleFaceRemoval}
          onClearRemovals={qc.clearPendingRemovals}
          onRemoveSelected={qc.removeSelectedFaces}
          onConfirmCluster={handleStep1Confirm}
          onGoBack={qc.goBackCluster}
          onLoadImages={loadClusterImages}
          onPreloadImages={preloadCluster}
        />
      )}

      {currentStep === '2' && (
        <Step2Merge
          activeClusters={qc.activeClusters}
          selectedClusters={qc.selectedClusters}
          getImageUrl={getImageUrl}
          onToggleCluster={qc.toggleClusterSelection}
          onMerge={qc.mergeClusters}
          onClearSelections={qc.clearClusterSelections}
          onContinue={() => navigateStep('3')}
          onLoadImages={loadClusterImages}
        />
      )}

      {currentStep === '3' && (
        <Step3Reassign
          activeClusters={qc.activeClusters}
          removed={qc.removed}
          currentRemovedIndex={qc.currentRemovedIndex}
          currentRemovedFace={qc.currentRemovedFace}
          getImageUrl={getImageUrl}
          getFullImageUrl={getFullImageUrl}
          onAssign={qc.assignFaceToCluster}
          onCreateNew={qc.createNewClusterForFace}
          onDiscard={qc.discardFace}
          onGoBack={qc.goBackRemovedFace}
          onContinue={handleStep3Continue}
          onLoadImages={loadClusterImages}
        />
      )}

      {currentStep === 'export' && (
        <StepExport
          projectId={project.id}
          projectName={project.name}
          clusters={qc.clusters}
          removed={qc.removed}
          discarded={qc.discarded}
          onComplete={() => router.push('/dashboard')}
        />
      )}
    </div>
  )
}
