import { create } from 'zustand'

export interface LeanCanvasData {
  title: string
  problem: string[]
  solution: string[]
  keyMetrics: string[]
  uniqueValueProposition: string
  unfairAdvantage: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
}

interface LeanCanvasStore {
  data: LeanCanvasData | null
  analysis: string
  isAnalyzing: boolean
  isSaving: boolean

  setData: (data: LeanCanvasData | null) => void
  setAnalysis: (analysis: string) => void
  setAnalyzing: (loading: boolean) => void
  setSaving: (loading: boolean) => void
  reset: () => void
}

export const useLeanCanvasStore = create<LeanCanvasStore>((set) => ({
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
