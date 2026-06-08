'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImagesWithProgress, getStoragePath } from '@/lib/storage'
import { createProject, initProjectState } from '@/lib/project'
import ProgressBar from '@/components/ui/ProgressBar'
import type { ClusterState, UploadProgress } from '@/lib/types'

type Stage = 'form' | 'uploading' | 'done'

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [clusterCount, setClusterCount] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)
  const [stage, setStage] = useState<Stage>('form')
  const [progress, setProgress] = useState<UploadProgress>({ total: 0, uploaded: 0, failed: [], isComplete: false })
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fl = e.target.files
    if (!fl || fl.length === 0) return
    setFiles(fl)

    // Detect clusters (unique first-level subdirectory names)
    const clusterIds = new Set<string>()
    let count = 0
    for (let i = 0; i < fl.length; i++) {
      const parts = (fl[i].webkitRelativePath || fl[i].name).split('/')
      if (parts.length >= 2) {
        clusterIds.add(parts[1])
        count++
      }
    }
    setClusterCount(clusterIds.size)
    setTotalFiles(count)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!files || files.length === 0) { setError('Please select a folder.'); return }
    if (!name.trim()) { setError('Project name is required.'); return }

    setError('')
    setStage('uploading')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create project
      const project = await createProject(name.trim(), description.trim(), user.id)

      // Build file list with cluster IDs
      const fileList: { file: File; clusterId: string; filename: string }[] = []
      const clusterMap = new Map<string, { filename: string; originalCluster: string }[]>()

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const parts = (file.webkitRelativePath || file.name).split('/')
        if (parts.length < 2) continue
        const clusterId = parts[1]
        const filename = parts[parts.length - 1]
        fileList.push({ file, clusterId, filename })

        if (!clusterMap.has(clusterId)) clusterMap.set(clusterId, [])
        clusterMap.get(clusterId)!.push({ filename, originalCluster: clusterId })
      }

      // Upload images
      const { storagePaths, failedFiles } = await uploadImagesWithProgress(
        user.id,
        project.id,
        fileList,
        setProgress
      )

      if (failedFiles.length > 0 && failedFiles.length === fileList.length) {
        throw new Error('All uploads failed. Check your internet connection.')
      }

      // Insert project_images records
      const imageRows = storagePaths.map(({ clusterId, filename, storagePath }) => ({
        project_id: project.id,
        cluster_id: clusterId,
        filename,
        storage_path: storagePath,
      }))

      if (imageRows.length > 0) {
        const BATCH = 500
        for (let i = 0; i < imageRows.length; i += BATCH) {
          const { error: imgErr } = await supabase.from('project_images').insert(imageRows.slice(i, i + BATCH))
          if (imgErr) throw imgErr
        }
      }

      // Build initial cluster state from uploaded files (only successfully uploaded)
      const uploadedByCluster = new Map<string, string[]>()
      for (const { clusterId, filename } of storagePaths) {
        if (!uploadedByCluster.has(clusterId)) uploadedByCluster.set(clusterId, [])
        uploadedByCluster.get(clusterId)!.push(filename)
      }

      const clusters: ClusterState[] = Array.from(uploadedByCluster.entries())
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([id, filenames]) => ({
          id,
          faces: filenames.map(fn => ({ filename: fn, originalCluster: id })),
        }))

      // Init project state + update step
      await initProjectState(project.id, clusters)
      await supabase
        .from('projects')
        .update({ current_step: 'ready', updated_at: new Date().toISOString() })
        .eq('id', project.id)

      setStage('done')
      setTimeout(() => router.push(`/projects/${project.id}`), 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setStage('form')
    }
  }

  if (stage === 'uploading') {
    return (
      <UploadingScreen progress={progress} />
    )
  }

  if (stage === 'done') {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '0 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Upload complete!</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Redirecting to your project…</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '580px', margin: '2rem auto', padding: '0 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <a href="/dashboard" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textDecoration: 'none' }}>← Dashboard</a>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>New project</h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--red-light)', color: '#b91c1c', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
              Project name *
            </label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Wedding 2024 — Batch 3" required />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.375rem' }}>
              Description (optional)
            </label>
            <input className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Any notes about this batch…" />
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Upload cluster folder</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Select the root folder. Each subfolder should be a cluster ID containing face images.
          </p>

          <div
            className="dropzone"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              multiple
              onChange={handleFilesChange}
              style={{ display: 'none' }}
            />
            {files ? (
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📁</div>
                <div style={{ fontWeight: 600 }}>{clusterCount} clusters</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {totalFiles.toLocaleString()} images selected
                </div>
                {totalFiles > 5000 && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'var(--amber-light)', color: '#92400e', borderRadius: '6px', fontSize: '0.8125rem' }}>
                    ⚠ Large upload — this may take a few minutes.
                  </div>
                )}
                <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--blue)' }}>
                  Click to select a different folder
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📂</div>
                <div style={{ fontWeight: 500 }}>Click to select folder</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Each subfolder = one cluster
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!files || !name.trim()}
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
        >
          Create project &amp; upload
        </button>
      </form>
    </div>
  )
}

function UploadingScreen({ progress }: { progress: UploadProgress }) {
  const pct = progress.total > 0 ? Math.round((progress.uploaded / progress.total) * 100) : 0

  return (
    <div style={{ maxWidth: '500px', margin: '4rem auto', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.125rem', marginBottom: '0.5rem' }}>Uploading images…</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {progress.uploaded.toLocaleString()} / {progress.total.toLocaleString()} images
          {progress.failed.length > 0 && <span style={{ color: 'var(--red)' }}> · {progress.failed.length} failed</span>}
        </p>
        <ProgressBar value={progress.uploaded} max={progress.total} label={`${pct}% complete`} />
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
          Please keep this tab open until the upload completes.
        </p>
      </div>
    </div>
  )
}
