import { create } from 'zustand'

export interface Collaborator {
    id: string
    name: string
    avatar?: string
    color: string
    cursor?: { x: number, y: number }
    activeElementId?: string
    lastActive: number
}

interface CollaborationState {
    collaborators: Collaborator[]
    activeProjectId: string | null
    isConnecting: boolean
    error: string | null

    setCollaborators: (collaborators: Collaborator[]) => void
    updateCollaborator: (id: string, updates: Partial<Collaborator>) => void
    setActiveProject: (id: string | null) => void
    setConnectionState: (isConnecting: boolean, error?: string | null) => void
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
    collaborators: [],
    activeProjectId: null,
    isConnecting: false,
    error: null,

    setCollaborators: (collaborators) => set({ collaborators }),

    updateCollaborator: (id, updates) => set((state) => ({
        collaborators: state.collaborators.map((c) =>
            c.id === id ? { ...c, ...updates, lastActive: Date.now() } : c
        )
    })),

    setActiveProject: (id) => set({ activeProjectId: id }),

    setConnectionState: (isConnecting, error = null) => set({ isConnecting, error })
}))
