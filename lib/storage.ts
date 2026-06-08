import { createClient } from '@/lib/supabase/client'
import type { UploadProgress } from '@/lib/types'

const BUCKET = 'cluster-images'
const SIGNED_URL_EXPIRY = 3600 // 1 hour

export function getStoragePath(userId: string, projectId: string, clusterId: string, filename: string): string {
  return `${userId}/${projectId}/${clusterId}/${filename}`
}

export async function uploadImage(
  storagePath: string,
  file: File
): Promise<{ path: string; error: Error | null }> {
  const supabase = createClient()
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: true })
  return { path: storagePath, error: error ? new Error(error.message) : null }
}

export async function uploadImagesWithProgress(
  userId: string,
  projectId: string,
  files: { file: File; clusterId: string; filename: string }[],
  onProgress: (progress: UploadProgress) => void
): Promise<{ storagePaths: { clusterId: string; filename: string; storagePath: string }[]; failedFiles: string[] }> {
  const supabase = createClient()
  const CONCURRENCY = 5
  const storagePaths: { clusterId: string; filename: string; storagePath: string }[] = []
  const failedFiles: string[] = []
  let uploaded = 0

  onProgress({ total: files.length, uploaded: 0, failed: [], isComplete: false })

  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY)
    await Promise.all(
      batch.map(async ({ file, clusterId, filename }) => {
        const storagePath = getStoragePath(userId, projectId, clusterId, filename)
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, { upsert: true })

        if (error) {
          failedFiles.push(filename)
        } else {
          storagePaths.push({ clusterId, filename, storagePath })
        }
        uploaded++
        onProgress({ total: files.length, uploaded, failed: failedFiles, isComplete: false })
      })
    )
  }

  onProgress({ total: files.length, uploaded: files.length, failed: failedFiles, isComplete: true })
  return { storagePaths, failedFiles }
}

export async function getSignedUrls(
  storagePaths: string[]
): Promise<Map<string, string>> {
  const supabase = createClient()
  const urlMap = new Map<string, string>()
  if (storagePaths.length === 0) return urlMap

  // Batch in groups of 500 (Supabase limit)
  const BATCH = 500
  for (let i = 0; i < storagePaths.length; i += BATCH) {
    const batch = storagePaths.slice(i, i + BATCH)
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(batch, SIGNED_URL_EXPIRY)

    if (!error && data) {
      data.forEach((item, idx) => {
        if (item.signedUrl) {
          urlMap.set(batch[idx], item.signedUrl)
        }
      })
    }
  }

  return urlMap
}

export async function getSignedUrl(storagePath: string): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)
  if (error || !data) return null
  return data.signedUrl
}

export async function getClusterStoragePaths(
  projectId: string,
  clusterId: string
): Promise<{ filename: string; storagePath: string }[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_images')
    .select('filename, storage_path')
    .eq('project_id', projectId)
    .eq('cluster_id', clusterId)
  if (error) return []
  return (data ?? []).map(r => ({ filename: r.filename, storagePath: r.storage_path }))
}

export async function getProjectStoragePaths(
  projectId: string
): Promise<{ clusterId: string; filename: string; storagePath: string }[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_images')
    .select('cluster_id, filename, storage_path')
    .eq('project_id', projectId)
  if (error) return []
  return (data ?? []).map(r => ({ clusterId: r.cluster_id, filename: r.filename, storagePath: r.storage_path }))
}
