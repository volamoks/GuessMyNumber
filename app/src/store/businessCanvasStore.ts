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
  isAnalyzing: boolean
  isSaving: boolean

  setData: (data: BusinessCanvasData | null) => void
  setAnalysis: (analysis: string) => void
  setAnalyzing: (loading: boolean) => void
  setSaving: (loading: boolean) => void
  reset: () => void
}

export const useBusinessCanvasStore = create<BusinessCanvasStore>((set) => ({
  data: null,
  analysis: '',
  isAnalyzing: false,
  isSaving: false,

  setData: (data) => set({ data }),
  setAnalysis: (analysis) => set({ analysis }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setSaving: (isSaving) => set({ isSaving }),

  reset: () =>
    set({
      data: null,
      analysis: '',
      isAnalyzing: false,
      isSaving: false,
    }),
}))
