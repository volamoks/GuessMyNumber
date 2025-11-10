/**
 * Base Store Factory - DRY principle implementation
 * Eliminates code duplication across CJM, Business Canvas, Lean Canvas, and Roadmap stores
 */

/**
 * Base state interface - common fields for all stores
 */
export interface BaseStoreState<TData> {
  // Core data
  data: TData | null
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
  versions: TData[]
}

/**
 * Base actions interface - common actions for all stores
 */
export interface BaseStoreActions<TData> {
  // Data setters
  setData: (data: TData | null) => void
  setAnalysis: (analysis: string) => void
  setCurrentProjectId: (id: string | null) => void

  // Loading state setters
  setGenerating: (loading: boolean) => void
  setAnalyzing: (loading: boolean) => void
  setImproving: (loading: boolean) => void
  setSaving: (loading: boolean) => void
  setExporting: (loading: boolean) => void

  // UI state setters
  setShowGenerator: (show: boolean) => void
  setShowVersions: (show: boolean) => void
  toggleGenerator: () => void
  toggleVersions: () => void

  // Version management
  setVersions: (versions: TData[]) => void

  // Reset
  reset: () => void
}

/**
 * Complete base store type combining state and actions
 */
export type BaseStore<TData> = BaseStoreState<TData> & BaseStoreActions<TData>

/**
 * Initial state factory - creates default state object
 */
export const createInitialState = <TData>(): BaseStoreState<TData> => ({
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
})

/**
 * Base store implementation factory
 * Creates a complete store with all common functionality
 *
 * @param set - Zustand set function
 * @returns Complete store object with state and actions
 *
 * @example
 * ```ts
 * export const useCJMStore = create<BaseStore<CJMData>>((set) => ({
 *   ...createBaseStore<CJMData>(set),
 *   // Add custom actions here if needed
 * }))
 * ```
 */
export const createBaseStore = <TData>(
  set: (partial: Partial<BaseStore<TData>> | ((state: BaseStore<TData>) => Partial<BaseStore<TData>>)) => void
): BaseStore<TData> => ({
  // Initial state
  ...createInitialState<TData>(),

  // Data setters
  setData: (data) => set({ data }),
  setAnalysis: (analysis) => set({ analysis }),
  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),

  // Loading state setters
  setGenerating: (isGenerating) => set({ isGenerating }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setImproving: (isImproving) => set({ isImproving }),
  setSaving: (isSaving) => set({ isSaving }),
  setExporting: (isExporting) => set({ isExporting }),

  // UI state setters
  setShowGenerator: (showGenerator) => set({ showGenerator }),
  setShowVersions: (showVersions) => set({ showVersions }),
  toggleGenerator: () => set((state) => ({ showGenerator: !state.showGenerator })),
  toggleVersions: () => set((state) => ({ showVersions: !state.showVersions })),

  // Version management
  setVersions: (versions) => set({ versions }),

  // Reset - restores initial state
  reset: () => set(createInitialState<TData>()),
})
