'use client'

import { useState } from 'react'
import type { ClusterState } from '@/lib/types'

interface StepReadyProps {
  clusters: ClusterState[]
  projectName: string
  onStart: () => void
}

export default function StepReady({ clusters, projectName, onStart }: StepReadyProps) {
  const [starting, setStarting] = useState(false)
  const totalFaces = clusters.reduce((sum, c) => sum + c.faces.length, 0)

  function handleStart() {
    setStarting(true)
    onStart()
  }

  const steps = [
    { n: 1, title: 'Remove', desc: 'Click faces that don\'t belong in each cluster.' },
    { n: 2, title: 'Merge', desc: 'Combine clusters that belong to the same person.' },
    { n: 3, title: 'Reassign', desc: 'Decide where each removed face belongs.' },
    { n: 4, title: 'Export', desc: 'Download a CSV of all changes.' },
  ]

  return (
    <div style={{ maxWidth: 560, margin: '48px auto', padding: '0 24px' }}>
      <div className="card" style={{ padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: 'var(--green-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>✓</div>
            <h1 style={{ fontSize: 18, fontWeight: 600 }}>Ready to review</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text)' }}>{projectName}</strong> — {clusters.length} clusters, {totalFaces.toLocaleString()} faces uploaded successfully.
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <StatCard value={clusters.length} label="Clusters" />
          <StatCard value={totalFaces.toLocaleString()} label="Faces" />
          <StatCard value="4" label="Steps" />
        </div>

        {/* Steps list */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            What you&apos;ll do
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {steps.map(s => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-light)',
                  color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
                }}>
                  {s.n}
                </div>
                <div>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{s.title}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}> — {s.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleStart}
          disabled={starting}
          style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 14 }}
        >
          {starting ? (
            <>
              <span className="spinner" style={{ width: 14, height: 14 }} />
              Starting…
            </>
          ) : (
            'Start review →'
          )}
        </button>
      </div>
    </div>
  )
}

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg)', borderRadius: 8 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}
