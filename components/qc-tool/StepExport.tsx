'use client'

import { useState } from 'react'
import type { ClusterState, RemovedFace, CSVRow } from '@/lib/types'
import { generateCSVRows, rowsToCSV } from '@/lib/csv'
import { updateProjectStatus } from '@/lib/project'
import { useToast } from '@/components/ui/Toast'

interface StepExportProps {
  projectId: string
  clusters: ClusterState[]
  removed: RemovedFace[]
  discarded: string[]
  onComplete: () => void
}

export default function StepExport({ projectId, clusters, removed, discarded, onComplete }: StepExportProps) {
  const { showToast } = useToast()
  const [completing, setCompleting] = useState(false)

  const rows = generateCSVRows(clusters, removed, discarded)
  const csv = rowsToCSV(rows)

  const mergedCount = clusters.filter(c => c.mergedInto).length
  const reassignedCount = removed.filter(f => f.assignedTo && !f.isNewCluster).length
  const newClusterCount = removed.filter(f => f.isNewCluster).length
  const discardedCount = discarded.length + removed.filter(f => f.isDiscarded).length

  function copyCSV() {
    navigator.clipboard.writeText(csv).then(() => showToast('CSV copied to clipboard', 'success'))
  }

  function downloadCSV() {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cluster-qc-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV downloaded', 'success')
  }

  async function markComplete() {
    setCompleting(true)
    try {
      await updateProjectStatus(projectId, 'completed')
      showToast('Project marked as complete', 'success')
      onComplete()
    } catch {
      showToast('Failed to update status', 'error')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '0.5rem' }}>Export results</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {rows.length === 0 ? 'No changes were made.' : `${rows.length} change(s) to export.`}
      </p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatCard label="Clusters merged" value={mergedCount} color="var(--amber)" />
        <StatCard label="Faces reassigned" value={reassignedCount} color="var(--blue)" />
        <StatCard label="New clusters" value={newClusterCount} color="var(--green)" />
        <StatCard label="Faces discarded" value={discardedCount} color="var(--red)" />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={copyCSV} disabled={rows.length === 0}>
          Copy CSV
        </button>
        <button className="btn btn-secondary" onClick={downloadCSV} disabled={rows.length === 0}>
          Download .csv
        </button>
        <button
          className="btn btn-green"
          onClick={markComplete}
          disabled={completing}
          style={{ marginLeft: 'auto' }}
        >
          {completing ? 'Saving…' : 'Mark project as complete ✓'}
        </button>
      </div>

      {/* CSV preview table */}
      {rows.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', position: 'sticky', top: 0 }}>
                  {['filename', 'source_cluster', 'destination_cluster', 'change_type'].map(h => (
                    <th key={h} style={{ padding: '0.625rem 0.75rem', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.filename}</td>
                    <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>{row.source_cluster}</td>
                    <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>{row.destination_cluster}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span className={`badge badge-${typeColor(row.change_type)}`}>{row.change_type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rows.length === 0 && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No changes were made — nothing to export.
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{label}</div>
    </div>
  )
}

function typeColor(type: CSVRow['change_type']): string {
  const map = { merged: 'amber', reassigned: 'blue', discarded: 'red', new_cluster: 'green' }
  return map[type] ?? 'gray'
}
