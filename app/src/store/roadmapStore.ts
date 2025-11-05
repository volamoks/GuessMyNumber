import { create } from 'zustand'

export interface RoadmapFeature {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'feature' | 'bug_fix' | 'tech_debt' | 'improvement'
  effort: 'small' | 'medium' | 'large'
  status: 'planning' | 'in_progress' | 'done'
}

export interface RoadmapData {
  title: string
  description: string
  now: RoadmapFeature[]
  next: RoadmapFeature[]
  later: RoadmapFeature[]
}

interface RoadmapStore {
  data: RoadmapData | null
  isSaving: boolean

  setData: (data: RoadmapData | null) => void
  setSaving: (loading: boolean) => void
  reset: () => void
}

export const useRoadmapStore = create<RoadmapStore>((set) => ({
  data: null,
  isSaving: false,

  setData: (data) => set({ data }),
  setSaving: (isSaving) => set({ isSaving }),

  reset: () =>
    set({
      data: null,
      isSaving: false,
    }),
}))
