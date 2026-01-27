import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'admin' | 'editor' | 'viewer'
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (user: User) => void
    logout: () => void
    updateUser: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,

            login: (user) => set({
                user,
                isAuthenticated: true,
                isLoading: false
            }),

            logout: () => set({
                user: null,
                isAuthenticated: false
            }),

            updateUser: (updates) => set((state) => ({
                user: state.user ? { ...state.user, ...updates } : null
            }))
        }),
        {
            name: 'auth-storage',
        }
    )
)
