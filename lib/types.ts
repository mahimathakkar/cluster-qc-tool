export interface Profile {
  id: string
  email: string
  role: 'user' | 'admin'
  created_at: string
}

export type ProjectStep = 'upload' | 'ready' | '1' | '2' | '3' | 'export'
export type ProjectStatus = 'active' | 'completed' | 'archived'

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  status: ProjectStatus
  current_step: ProjectStep
  created_at: string
  updated_at: string
}

export interface FaceItem {
  filename: string
  originalCluster: string
}

export interface ClusterState {
  id: string
  faces: FaceItem[]
  mergedInto?: string
}

export interface RemovedFace {
  filename: string
  sourceCluster: string
  assignedTo?: string
  isDiscarded: boolean
  isNewCluster: boolean
}

export interface PersistedQCState {
  clusters: ClusterState[]
  removed: RemovedFace[]
  discarded: string[]
  currentClusterIndex: number
  currentRemovedIndex: number
  newClusterCounter: number
}

export interface ProjectStateRow {
  id: string
  project_id: string
  clusters: ClusterState[]
  removed: RemovedFace[]
  discarded: string[]
  current_cluster_index: number
  current_removed_index: number
  new_cluster_counter: number
  updated_at: string
}

export interface ProjectImage {
  id: string
  project_id: string
  cluster_id: string
  filename: string
  storage_path: string
  created_at: string
}

export interface CSVRow {
  filename: string
  source_cluster: string
  destination_cluster: string
  change_type: 'merged' | 'reassigned' | 'discarded' | 'new_cluster'
}

export interface UploadProgress {
  total: number
  uploaded: number
  failed: string[]
  isComplete: boolean
}

export interface SignedUrlEntry {
  url: string
  expiresAt: number
}
