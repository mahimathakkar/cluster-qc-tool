import { createClient } from '@/lib/supabase/client'
import type { Project, ProjectStep, ProjectStatus, ClusterState, RemovedFace, PersistedQCState } from '@/lib/types'

export async function getProjects(userId?: string): Promise<Project[]> {
  const supabase = createClient()
  let query = supabase.from('projects').select('*').order('updated_at', { ascending: false })
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error) return null
  return data
}

export async function createProject(name: string, description: string, userId: string): Promise<Project> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .insert({ name, description, user_id: userId, status: 'active', current_step: 'upload' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProjectStep(id: string, step: ProjectStep) {
  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .update({ current_step: step, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updateProjectStatus(id: string, status: ProjectStatus) {
  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function archiveProject(id: string) {
  return updateProjectStatus(id, 'archived')
}

export async function getProjectState(projectId: string): Promise<PersistedQCState | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('project_states')
    .select('*')
    .eq('project_id', projectId)
    .single()
  if (error) return null
  return {
    clusters: data.clusters ?? [],
    removed: data.removed ?? [],
    discarded: data.discarded ?? [],
    currentClusterIndex: data.current_cluster_index ?? 0,
    currentRemovedIndex: data.current_removed_index ?? 0,
    newClusterCounter: data.new_cluster_counter ?? 0,
  }
}

export async function saveProjectState(projectId: string, state: PersistedQCState): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('project_states')
    .upsert({
      project_id: projectId,
      clusters: state.clusters,
      removed: state.removed,
      discarded: state.discarded,
      current_cluster_index: state.currentClusterIndex,
      current_removed_index: state.currentRemovedIndex,
      new_cluster_counter: state.newClusterCounter,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'project_id' })
  if (error) throw error
}

export async function initProjectState(projectId: string, clusters: ClusterState[]): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('project_states')
    .insert({
      project_id: projectId,
      clusters,
      removed: [],
      discarded: [],
      current_cluster_index: 0,
      current_removed_index: 0,
      new_cluster_counter: 0,
    })
  if (error) throw error
}
