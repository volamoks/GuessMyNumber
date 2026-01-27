import { create } from 'zustand'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
    id: string
    type: NotificationType
    message: string
    description?: string
    duration?: number
}

interface NotificationStore {
    notifications: Notification[]
    addNotification: (notification: Omit<Notification, 'id'>) => string
    removeNotification: (id: string) => void
    clearNotifications: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],

    addNotification: (notification) => {
        const id = Math.random().toString(36).substring(2, 9)
        const newNotification = { ...notification, id }

        set((state) => ({
            notifications: [...state.notifications, newNotification]
        }))

        // Auto-dismissal
        if (notification.duration !== 0) {
            setTimeout(() => {
                set((state) => ({
                    notifications: state.notifications.filter((n) => n.id !== id)
                }))
            }, notification.duration || 5000)
        }

        return id
    },

    removeNotification: (id) => {
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id)
        }))
    },

    clearNotifications: () => {
        set({ notifications: [] })
    }
}))
