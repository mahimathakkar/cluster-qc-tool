import type { ClusterState, RemovedFace, CSVRow } from '@/lib/types'

export function generateCSVRows(
  clusters: ClusterState[],
  removed: RemovedFace[],
  _discarded: string[] // kept for compat; discarded status is tracked via removed[].isDiscarded
): CSVRow[] {
  const rows: CSVRow[] = []

  // Faces absorbed during cluster merges
  for (const cluster of clusters) {
    if (!cluster.mergedInto) continue
    for (const face of cluster.faces) {
      rows.push({
        filename: face.filename,
        source_cluster: face.originalCluster,
        destination_cluster: cluster.mergedInto,
        change_type: 'merged',
      })
    }
  }

  // Removed faces: reassigned, new cluster, or discarded
  for (const face of removed) {
    if (face.isDiscarded) {
      rows.push({
        filename: face.filename,
        source_cluster: face.sourceCluster,
        destination_cluster: 'discarded',
        change_type: 'discarded',
      })
    } else if (face.assignedTo) {
      rows.push({
        filename: face.filename,
        source_cluster: face.sourceCluster,
        destination_cluster: face.assignedTo,
        change_type: face.isNewCluster ? 'new_cluster' : 'reassigned',
      })
    }
    // Faces still pending (not yet processed in step 3) are omitted
  }

  return rows
}

export function rowsToCSV(rows: CSVRow[]): string {
  const header = 'filename,source_cluster,destination_cluster,change_type'
  const lines = rows.map(r =>
    [r.filename, r.source_cluster, r.destination_cluster, r.change_type]
      .map(v => `"${v.replace(/"/g, '""')}"`)
      .join(',')
  )
  return [header, ...lines].join('\n')
}
