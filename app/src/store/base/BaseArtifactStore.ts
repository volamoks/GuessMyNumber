/**
 * Base interfaces and types for artifact stores
 * Eliminates ~70% code duplication across businessCanvas, leanCanvas, CJM stores
 */

/**
 * Base artifact data structure - all artifacts must have a title
 */
export interface BaseArtifactData {
  title: string
}

/**
 * Generic base store state that all artifact stores share
 */
export interface BaseArtifactState<T extends BaseArtifactData> {
  // Core data
  data: T | null
  analysis: string
  currentProjectId: string | null

  // Loading states
  isGenerating: boolean
  isAnalyzing: boolean
  isImproving: boolean
  isSaving: boolean
  isExporting: boolean

  // UI states
  showGenerator: boolean
  showVersions: boolean
  versions: any[] // TODO: Define proper Version type in future
}

/**
 * Generic base store actions that all artifact stores share
 */
export interface BaseArtifactActions<T extends BaseArtifactData> {
  // Data actions
  setData: (data: T | null) => void
  setAnalysis: (analysis: string) => void
  setCurrentProjectId: (id: string | null) => void

  // Loading state actions
  setGenerating: (loading: boolean) => void
  setAnalyzing: (loading: boolean) => void
  setImproving: (loading: boolean) => void
  setSaving: (loading: boolean) => void
  setExporting: (loading: boolean) => void

  // UI state actions
  setShowGenerator: (show: boolean) => void
  setShowVersions: (show: boolean) => void
  toggleGenerator: () => void
  toggleVersions: () => void
  setVersions: (versions: any[]) => void

  // Reset
  reset: () => void
}

/**
 * Complete base store combining state and actions
 */
export type BaseArtifactStore<T extends BaseArtifactData> =
  BaseArtifactState<T> & BaseArtifactActions<T>
