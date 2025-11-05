import { create } from 'zustand'
import type { Project, ProjectVersion } from '@/lib/projects-service'

interface ProjectsStore {
  list: Project[]
  current: Project | null
  versions: ProjectVersion[]
  isLoading: boolean

  // Actions
  setProjects: (projects: Project[]) => void
  setCurrent: (project: Project | null) => void
  setVersions: (versions: ProjectVersion[]) => void
  setLoading: (loading: boolean) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
}

export const useProjectsStore = create<ProjectsStore>((set) => ({
  list: [],
  current: null,
  versions: [],
  isLoading: false,

  setProjects: (list) => set({ list }),
  setCurrent: (current) => set({ current }),
  setVersions: (versions) => set({ versions }),
  setLoading: (isLoading) => set({ isLoading }),

  addProject: (project) =>
    set((state) => ({
      list: [project, ...state.list],
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      list: state.list.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removeProject: (id) =>
    set((state) => ({
      list: state.list.filter((p) => p.id !== id),
    })),
}))
