import { create } from 'zustand'

interface UIState {
    isSidebarOpen: boolean
    activeModal: string | null

    // Actions
    toggleSidebar: () => void
    setSidebarOpen: (open: boolean) => void
    openModal: (modalId: string) => void
    closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: true,
    activeModal: null,

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (open) => set({ isSidebarOpen: open }),
    openModal: (modalId) => set({ activeModal: modalId }),
    closeModal: () => set({ activeModal: null }),
}))
