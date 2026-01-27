import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { projectsService, type Project, type ProjectType } from '@/lib/projects-service'
import { toast } from 'sonner'

interface ProjectState<T = any> {
    // Persistent State
    currentProjectId: string | null

    // In-Memory State
    data: T | null
    isLoading: boolean
    isSaving: boolean
    error: string | null
    lastSaved: Date | null

    // Actions
    setCurrentProjectId: (id: string | null) => void
    loadProject: (id?: string) => Promise<void>
    saveProject: (data: T, silent?: boolean) => Promise<void>
    createProject: (title: string, type: ProjectType, data: T, description?: string) => Promise<string | null>
    resetProject: () => void
    updateData: (data: T) => void // Optimistic updates
}

export const useProjectStore = create<ProjectState>()(
    persist(
        (set, get) => ({
            currentProjectId: null,
            data: null,
            isLoading: false,
            isSaving: false,
            error: null,
            lastSaved: null,

            setCurrentProjectId: (id) => set({ currentProjectId: id }),

            loadProject: async (id) => {
                const targetId = id || get().currentProjectId
                if (!targetId) return

                // If we're already loading this project, skip
                // if (get().isLoading && get().currentProjectId === targetId) return 

                set({ isLoading: true, error: null, currentProjectId: targetId })

                try {
                    const project = await projectsService.getProject(targetId)
                    if (project) {
                        set({
                            data: project.data,
                            lastSaved: new Date(project.updated_at),
                            error: null
                        })
                    } else {
                        set({ error: 'Project not found', data: null })
                    }
                } catch (err) {
                    set({ error: (err as Error).message, data: null })
                    toast.error('Failed to load project')
                } finally {
                    set({ isLoading: false })
                }
            },

            saveProject: async (data, silent = false) => {
                const { currentProjectId } = get()
                if (!currentProjectId) return

                set({ isSaving: true, data }) // Update local state immediately

                try {
                    await projectsService.updateProject(currentProjectId, { data })
                    set({ lastSaved: new Date() })
                    if (!silent) toast.success('Saved!')
                } catch (err) {
                    console.error('Save failed:', err)
                    if (!silent) toast.error('Failed to save')
                    // Optional: revert data on failure? For now, we keep local changes.
                } finally {
                    set({ isSaving: false })
                }
            },

            createProject: async (title, type, data, description) => {
                set({ isSaving: true, error: null })
                try {
                    const project = await projectsService.createProject(title, type, data, description)
                    if (project) {
                        set({
                            currentProjectId: project.id,
                            data: project.data,
                            lastSaved: new Date(project.created_at),
                            error: null
                        })
                        toast.success('Project created!')
                        return project.id
                    }
                    return null
                } catch (err) {
                    set({ error: (err as Error).message })
                    toast.error('Failed to create project')
                    return null
                } finally {
                    set({ isSaving: false })
                }
            },

            resetProject: () => set({
                currentProjectId: null,
                data: null,
                error: null,
                lastSaved: null
            }),

            updateData: (data) => set({ data }),
        }),
        {
            name: 'project-storage',
            partialize: (state) => ({
                currentProjectId: state.currentProjectId
            }), // Only persist the ID, fetch fresh data on load
        }
    )
)
