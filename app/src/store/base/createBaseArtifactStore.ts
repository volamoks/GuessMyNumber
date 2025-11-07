/**
 * Factory functions for creating base artifact stores
 * Eliminates code duplication by providing reusable store creators
 */

import type { StateCreator } from 'zustand'
import type {
  BaseArtifactData,
  BaseArtifactState,
  BaseArtifactActions,
} from './BaseArtifactStore'

/**
 * Creates initial state for an artifact store
 * @returns Base state object with all fields initialized
 */
export function createBaseStoreState<
  T extends BaseArtifactData
>(): BaseArtifactState<T> {
  return {
    data: null,
    analysis: '',
    currentProjectId: null,
    isGenerating: false,
    isAnalyzing: false,
    isImproving: false,
    isSaving: false,
    isExporting: false,
    showGenerator: false,
    showVersions: false,
    versions: [],
  }
}

/**
 * Creates base actions for an artifact store
 * @param set - Zustand's set function
 * @returns Object with all base actions implemented
 */
export function createBaseStoreActions<T extends BaseArtifactData>(
  set: Parameters<StateCreator<BaseArtifactState<T> & BaseArtifactActions<T>>>[0]
): BaseArtifactActions<T> {
  return {
    // Data actions
    setData: (data) => set({ data }),
    setAnalysis: (analysis) => set({ analysis }),
    setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),

    // Loading state actions
    setGenerating: (isGenerating) => set({ isGenerating }),
    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
    setImproving: (isImproving) => set({ isImproving }),
    setSaving: (isSaving) => set({ isSaving }),
    setExporting: (isExporting) => set({ isExporting }),

    // UI state actions
    setShowGenerator: (showGenerator) => set({ showGenerator }),
    setShowVersions: (showVersions) => set({ showVersions }),
    toggleGenerator: () =>
      set((state) => ({ showGenerator: !state.showGenerator })),
    toggleVersions: () =>
      set((state) => ({ showVersions: !state.showVersions })),
    setVersions: (versions) => set({ versions }),

    // Reset action
    reset: () =>
      set({
        data: null,
        analysis: '',
        currentProjectId: null,
        isGenerating: false,
        isAnalyzing: false,
        isImproving: false,
        isSaving: false,
        isExporting: false,
        showGenerator: false,
        showVersions: false,
        versions: [],
      }),
  }
}
