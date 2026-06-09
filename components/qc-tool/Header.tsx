'use client'

import type { ProjectStep } from '@/lib/types'

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
  backLoading?: boolean
  onBack?: () => void
}

export default function Header({ projectName, currentStep, saveStatus, backLoading, onBack }: HeaderProps) {
  const activeIdx = STEPS.findIndex(s => s.key === currentStep)

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Back */}
      <button
        onClick={onBack}
        disabled={backLoading}
        style={{
          background: 'none',
          border: 'none',
          cursor: backLoading ? 'not-allowed' : 'pointer',
          color: 'var(--text-muted)',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '4px 0',
          flexShrink: 0,
          fontWeight: 500,
          opacity: backLoading ? 0.6 : 1,
          fontFamily: 'inherit',
        }}
      >
        {backLoading ? (
          <>
            <span className="spinner" style={{ width: 12, height: 12 }} />
            Saving…
          </>
        ) : (
          '← Dashboard'
        )}
      </button>

      <span style={{
        fontWeight: 600,
        fontSize: 14,
        flexShrink: 0,
        maxWidth: 200,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: 'var(--text)',
      }}>
        {projectName}
      </span>

      {/* Stepper */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="stepper">
          {STEPS.map((step, idx) => {
            const isDone = idx < activeIdx
            const isActive = idx === activeIdx
            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
                {idx > 0 && (
                  <div
                    className={`step-connector ${isDone ? 'done' : 'pending'}`}
                  />
                )}
                <div className="step-node">
                  <div className={`step-dot ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
                    {isDone ? '✓' : idx + 1}
                  </div>
                  <span style={{
                    fontSize: 11,
                    color: isActive ? 'var(--text)' : isDone ? 'var(--green)' : 'var(--text-subtle)',
                    fontWeight: isActive ? 600 : 500,
                    marginLeft: 4,
                  }}>
                    {step.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Save status */}
      <div style={{ flexShrink: 0, fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5, minWidth: 72, justifyContent: 'flex-end' }}>
        {saveStatus === 'saving' && (
          <>
            <span className="spinner" style={{ width: 10, height: 10 }} />
            <span>Saving</span>
          </>
        )}
        {saveStatus === 'saved' && (
          <span style={{ color: 'var(--green)', fontWeight: 500 }}>Saved ✓</span>
        )}
        {saveStatus === 'error' && (
          <span style={{ color: 'var(--red)' }}>Save failed</span>
        )}
      </div>
    </header>
  )
}
