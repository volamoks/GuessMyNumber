import { create } from 'zustand'

export interface BusinessCanvasData {
  title: string
  keyPartners: string[]
  keyActivities: string[]
  keyResources: string[]
  valueProposition: string[]
  customerRelationships: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
}

interface BusinessCanvasStore {
  data: BusinessCanvasData | null
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
  versions: any[]

  // Actions
  setData: (data: BusinessCanvasData | null) => void
  setAnalysis: (analysis: string) => void
  setCurrentProjectId: (id: string | null) => void
  setGenerating: (loading: boolean) => void
  setAnalyzing: (loading: boolean) => void
  setImproving: (loading: boolean) => void
  setSaving: (loading: boolean) => void
  setExporting: (loading: boolean) => void
  setShowGenerator: (show: boolean) => void
  setShowVersions: (show: boolean) => void
  toggleGenerator: () => void
  toggleVersions: () => void
  setVersions: (versions: any[]) => void
  reset: () => void
}

export const useBusinessCanvasStore = create<BusinessCanvasStore>((set) => ({
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

  setData: (data) => set({ data }),
  setAnalysis: (analysis) => set({ analysis }),
  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setImproving: (isImproving) => set({ isImproving }),
  setSaving: (isSaving) => set({ isSaving }),
  setExporting: (isExporting) => set({ isExporting }),
  setShowGenerator: (showGenerator) => set({ showGenerator }),
  setShowVersions: (showVersions) => set({ showVersions }),
  toggleGenerator: () => set((state) => ({ showGenerator: !state.showGenerator })),
  toggleVersions: () => set((state) => ({ showVersions: !state.showVersions })),
  setVersions: (versions) => set({ versions }),

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
}))
