'use client'

import { useState, useCallback } from 'react'
import type { ClusterState, RemovedFace, PersistedQCState, FaceItem } from '@/lib/types'

export interface QCActions {
  // Step 1
  pendingRemovals: Set<string>
  toggleFaceRemoval: (filename: string) => void
  clearPendingRemovals: () => void
  removeSelectedFaces: () => void
  confirmClusterReview: () => void
  goBackCluster: () => void

  // Step 2
  selectedClusters: Set<string>
  toggleClusterSelection: (clusterId: string) => void
  clearClusterSelections: () => void
  mergeClusters: () => void

  // Step 3
  assignFaceToCluster: (filename: string, clusterId: string) => void
  createNewClusterForFace: (filename: string) => void
  discardFace: (filename: string) => void
  goBackRemovedFace: () => void

  // Getters
  activeClusters: ClusterState[]
  currentCluster: ClusterState | null
  currentRemovedFace: RemovedFace | null
  totalFacesChanged: number
}

export interface UseQCStateReturn extends PersistedQCState, QCActions {}

export function useQCState(initial: PersistedQCState, onChange: (state: PersistedQCState) => void): UseQCStateReturn {
  const [clusters, setClusters] = useState<ClusterState[]>(initial.clusters)
  const [removed, setRemoved] = useState<RemovedFace[]>(initial.removed)
  const [discarded, setDiscarded] = useState<string[]>(initial.discarded)
  const [currentClusterIndex, setCurrentClusterIndex] = useState(initial.currentClusterIndex)
  const [currentRemovedIndex, setCurrentRemovedIndex] = useState(initial.currentRemovedIndex)
  const [newClusterCounter, setNewClusterCounter] = useState(initial.newClusterCounter)

  // Ephemeral (not persisted)
  const [pendingRemovals, setPendingRemovals] = useState<Set<string>>(new Set())
  const [selectedClusters, setSelectedClusters] = useState<Set<string>>(new Set())

  const activeClusters = clusters.filter(c => !c.mergedInto)
  const currentCluster = activeClusters[currentClusterIndex] ?? null
  const pendingRemovedFaces = removed.filter(f => !f.isDiscarded && !f.assignedTo)
  const currentRemovedFace = pendingRemovedFaces[currentRemovedIndex] ?? null

  function notify(
    newClusters: ClusterState[],
    newRemoved: RemovedFace[],
    newDiscarded: string[],
    newClusterIdx: number,
    newRemovedIdx: number,
    newCounter: number,
  ) {
    onChange({
      clusters: newClusters,
      removed: newRemoved,
      discarded: newDiscarded,
      currentClusterIndex: newClusterIdx,
      currentRemovedIndex: newRemovedIdx,
      newClusterCounter: newCounter,
    })
  }

  // Step 1
  const toggleFaceRemoval = useCallback((filename: string) => {
    setPendingRemovals(prev => {
      const next = new Set(prev)
      if (next.has(filename)) next.delete(filename)
      else next.add(filename)
      return next
    })
  }, [])

  const clearPendingRemovals = useCallback(() => {
    setPendingRemovals(new Set())
  }, [])

  const removeSelectedFaces = useCallback(() => {
    if (!currentCluster || pendingRemovals.size === 0) return

    const newRemovedFaces: RemovedFace[] = Array.from(pendingRemovals).map(filename => ({
      filename,
      sourceCluster: currentCluster.id,
      isDiscarded: false,
      isNewCluster: false,
    }))

    const updatedClusters = clusters.map(c => {
      if (c.id !== currentCluster.id) return c
      return { ...c, faces: c.faces.filter(f => !pendingRemovals.has(f.filename)) }
    })

    const newRemoved = [...removed, ...newRemovedFaces]

    setClusters(updatedClusters)
    setRemoved(newRemoved)
    setPendingRemovals(new Set())
    notify(updatedClusters, newRemoved, discarded, currentClusterIndex, currentRemovedIndex, newClusterCounter)
  }, [currentCluster, pendingRemovals, clusters, removed, discarded, currentClusterIndex, currentRemovedIndex, newClusterCounter, onChange])

  const confirmClusterReview = useCallback(() => {
    if (!currentCluster) return

    // Move pending removals to removed array
    const newRemovedFaces: RemovedFace[] = Array.from(pendingRemovals).map(filename => ({
      filename,
      sourceCluster: currentCluster.id,
      isDiscarded: false,
      isNewCluster: false,
    }))

    // Remove faces from current cluster
    const updatedClusters = clusters.map(c => {
      if (c.id !== currentCluster.id) return c
      return {
        ...c,
        faces: c.faces.filter(f => !pendingRemovals.has(f.filename)),
      }
    })

    const newRemoved = [...removed, ...newRemovedFaces]
    const newIdx = currentClusterIndex + 1

    setClusters(updatedClusters)
    setRemoved(newRemoved)
    setCurrentClusterIndex(newIdx)
    setPendingRemovals(new Set())
    notify(updatedClusters, newRemoved, discarded, newIdx, currentRemovedIndex, newClusterCounter)
  }, [currentCluster, pendingRemovals, clusters, removed, discarded, currentClusterIndex, currentRemovedIndex, newClusterCounter, onChange])

  const goBackCluster = useCallback(() => {
    if (currentClusterIndex <= 0) return
    const newIdx = currentClusterIndex - 1
    setCurrentClusterIndex(newIdx)
    setPendingRemovals(new Set())
    // When going back, restore any removals that were confirmed for this cluster
    // by removing them from the removed array
    const prevCluster = activeClusters[newIdx]
    if (!prevCluster) return
    const facesToRestore = removed.filter(f => f.sourceCluster === prevCluster.id && !f.assignedTo && !f.isDiscarded)
    const restoredFilenames = new Set(facesToRestore.map(f => f.filename))
    const newRemoved = removed.filter(f => !restoredFilenames.has(f.filename))
    const updatedClusters = clusters.map(c => {
      if (c.id !== prevCluster.id) return c
      const restoredFaces: FaceItem[] = facesToRestore.map(f => ({
        filename: f.filename,
        originalCluster: f.sourceCluster,
      }))
      return { ...c, faces: [...c.faces, ...restoredFaces] }
    })
    setClusters(updatedClusters)
    setRemoved(newRemoved)
    notify(updatedClusters, newRemoved, discarded, newIdx, currentRemovedIndex, newClusterCounter)
  }, [currentClusterIndex, activeClusters, removed, clusters, discarded, currentRemovedIndex, newClusterCounter, onChange])

  // Step 2
  const toggleClusterSelection = useCallback((clusterId: string) => {
    setSelectedClusters(prev => {
      const next = new Set(prev)
      if (next.has(clusterId)) next.delete(clusterId)
      else next.add(clusterId)
      return next
    })
  }, [])

  const clearClusterSelections = useCallback(() => {
    setSelectedClusters(new Set())
  }, [])

  const mergeClusters = useCallback(() => {
    if (selectedClusters.size < 2) return

    const ids = Array.from(selectedClusters).sort()
    const targetId = ids[0]
    const sourceIds = ids.slice(1)

    const updatedClusters = clusters.map(c => {
      if (c.id === targetId) {
        // Absorb faces from all source clusters
        const absorbedFaces: FaceItem[] = []
        for (const sourceId of sourceIds) {
          const source = clusters.find(cl => cl.id === sourceId)
          if (source) absorbedFaces.push(...source.faces)
        }
        return { ...c, faces: [...c.faces, ...absorbedFaces] }
      }
      if (sourceIds.includes(c.id)) {
        return { ...c, faces: [], mergedInto: targetId }
      }
      return c
    })

    setClusters(updatedClusters)
    setSelectedClusters(new Set())
    notify(updatedClusters, removed, discarded, currentClusterIndex, currentRemovedIndex, newClusterCounter)
  }, [selectedClusters, clusters, removed, discarded, currentClusterIndex, currentRemovedIndex, newClusterCounter, onChange])

  // Step 3
  const assignFaceToCluster = useCallback((filename: string, clusterId: string) => {
    // Move face to target cluster
    const face = removed.find(f => f.filename === filename)
    if (!face) return

    const updatedRemoved = removed.map(f =>
      f.filename === filename ? { ...f, assignedTo: clusterId } : f
    )
    const updatedClusters = clusters.map(c => {
      if (c.id !== clusterId) return c
      return {
        ...c,
        faces: [...c.faces, { filename, originalCluster: face.sourceCluster }],
      }
    })

    const newIdx = currentRemovedIndex + 1
    setClusters(updatedClusters)
    setRemoved(updatedRemoved)
    setCurrentRemovedIndex(newIdx)
    notify(updatedClusters, updatedRemoved, discarded, currentClusterIndex, newIdx, newClusterCounter)
  }, [removed, clusters, discarded, currentClusterIndex, currentRemovedIndex, newClusterCounter, onChange])

  const createNewClusterForFace = useCallback((filename: string) => {
    const face = removed.find(f => f.filename === filename)
    if (!face) return

    const counter = newClusterCounter + 1
    const newClusterId = `new_${String(counter).padStart(3, '0')}`
    const newCluster: ClusterState = {
      id: newClusterId,
      faces: [{ filename, originalCluster: face.sourceCluster }],
    }

    const updatedRemoved = removed.map(f =>
      f.filename === filename ? { ...f, assignedTo: newClusterId, isNewCluster: true } : f
    )
    const updatedClusters = [...clusters, newCluster]
    const newIdx = currentRemovedIndex + 1

    setClusters(updatedClusters)
    setRemoved(updatedRemoved)
    setNewClusterCounter(counter)
    setCurrentRemovedIndex(newIdx)
    notify(updatedClusters, updatedRemoved, discarded, currentClusterIndex, newIdx, counter)
  }, [removed, clusters, discarded, currentClusterIndex, currentRemovedIndex, newClusterCounter, onChange])

  const discardFace = useCallback((filename: string) => {
    const updatedRemoved = removed.map(f =>
      f.filename === filename ? { ...f, isDiscarded: true } : f
    )
    const newDiscarded = [...discarded, filename]
    const newIdx = currentRemovedIndex + 1

    setRemoved(updatedRemoved)
    setDiscarded(newDiscarded)
    setCurrentRemovedIndex(newIdx)
    notify(clusters, updatedRemoved, newDiscarded, currentClusterIndex, newIdx, newClusterCounter)
  }, [removed, clusters, discarded, currentClusterIndex, currentRemovedIndex, newClusterCounter, onChange])

  const goBackRemovedFace = useCallback(() => {
    if (currentRemovedIndex <= 0) return
    const prevIdx = currentRemovedIndex - 1
    const prevFace = pendingRemovedFaces[prevIdx]
    if (!prevFace) return

    // Undo the action for the previous face
    const updatedRemoved = removed.map(f =>
      f.filename === prevFace.filename
        ? { ...f, assignedTo: undefined, isDiscarded: false, isNewCluster: false }
        : f
    )

    // Remove face from cluster it was assigned to
    let updatedClusters = clusters
    if (prevFace.assignedTo) {
      if (prevFace.isNewCluster) {
        updatedClusters = clusters.filter(c => c.id !== prevFace.assignedTo)
        setNewClusterCounter(prev => Math.max(0, prev - 1))
      } else {
        updatedClusters = clusters.map(c => {
          if (c.id !== prevFace.assignedTo) return c
          return { ...c, faces: c.faces.filter(f => f.filename !== prevFace.filename) }
        })
      }
    }
    // Restore discarded
    const updatedDiscarded = prevFace.isDiscarded ? discarded.filter(f => f !== prevFace.filename) : discarded

    setRemoved(updatedRemoved)
    setClusters(updatedClusters)
    setDiscarded(updatedDiscarded)
    setCurrentRemovedIndex(prevIdx)
    notify(updatedClusters, updatedRemoved, updatedDiscarded, currentClusterIndex, prevIdx, newClusterCounter)
  }, [currentRemovedIndex, pendingRemovedFaces, removed, clusters, discarded, currentClusterIndex, newClusterCounter, onChange])

  const totalFacesChanged =
    removed.filter(f => f.isDiscarded || f.assignedTo).length +
    clusters.filter(c => c.mergedInto).reduce((sum, c) => sum + c.faces.length, 0)

  return {
    clusters,
    removed,
    discarded,
    currentClusterIndex,
    currentRemovedIndex,
    newClusterCounter,
    pendingRemovals,
    selectedClusters,
    activeClusters,
    currentCluster,
    currentRemovedFace,
    totalFacesChanged,
    toggleFaceRemoval,
    clearPendingRemovals,
    removeSelectedFaces,
    confirmClusterReview,
    goBackCluster,
    toggleClusterSelection,
    clearClusterSelections,
    mergeClusters,
    assignFaceToCluster,
    createNewClusterForFace,
    discardFace,
    goBackRemovedFace,
  }
}
