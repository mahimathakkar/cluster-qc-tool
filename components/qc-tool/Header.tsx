'use client'

import Link from 'next/link'
import type { ProjectStep } from '@/lib/types'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const STEPS: { key: ProjectStep; label: string }[] = [
  { key: '1', label: 'Remove' },
  { key: '2', label: 'Merge' },
  { key: '3', label: 'Reassign' },
  { key: 'export', label: 'Export' },
]

interface HeaderProps {
  projectName: string
  projectId: string
  currentStep: ProjectStep
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  onBack?: () => void
}

export default function Header({ projectName, projectId: _projectId, currentStep, saveStatus, onBack }: HeaderProps) {
  const activeIdx = STEPS.findIndex(s => s.key === currentStep)

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Back link */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: 0,
          flexShrink: 0,
        }}
      >
        ← Dashboard
      </button>

      {/* Project name */}
      <span style={{ fontWeight: 600, fontSize: '0.9375rem', flexShrink: 0, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {projectName}
      </span>

      {/* Step progress */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0, justifyContent: 'center' }}>
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIdx
          const isActive = idx === activeIdx
          return (
            <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
              {idx > 0 && (
                <div style={{
                  width: '3rem',
                  height: '2px',
                  background: isDone || isActive ? (idx <= activeIdx ? 'var(--green)' : 'var(--border)') : 'var(--border)',
                  flexShrink: 0,
                }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <div className={`step-dot ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
                  {isDone ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '0.6875rem', color: isActive ? 'var(--text)' : 'var(--text-muted)', fontWeight: isActive ? 600 : 400 }}>
                  {step.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Save status */}
      <div style={{ flexShrink: 0, fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: '80px', justifyContent: 'flex-end' }}>
        {saveStatus === 'saving' && (
          <><LoadingSpinner size={12} /> Saving…</>
        )}
        {saveStatus === 'saved' && (
          <span style={{ color: 'var(--green)' }}>Saved ✓</span>
        )}
        {saveStatus === 'error' && (
          <span style={{ color: 'var(--red)' }}>Save failed</span>
        )}
      </div>
    </header>
  )
}
