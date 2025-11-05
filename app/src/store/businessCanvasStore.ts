import { create } from 'zustand'

interface CanvasData {
  title: string
  [key: string]: any
}

interface BusinessCanvasStore {
  data: CanvasData | null
  analysis: string
  isAnalyzing: boolean
  isSaving: boolean

  setData: (data: CanvasData | null) => void
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
