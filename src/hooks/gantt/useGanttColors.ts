import { useCallback } from 'react'
import type { TaskTypeColor } from '@/features/jira-gantt/components/types'

export function useGanttColors(colorField: string, customColors: TaskTypeColor[]) {
    // Получение цвета из CSS переменной
    const getCSSColor = useCallback((varName: string): string => {
        const root = document.documentElement
        // Check if window is defined (SSR safety, though this runs in client)
        if (typeof window === 'undefined') return 'hsl(215 16% 47%)'

        const hslValue = getComputedStyle(root).getPropertyValue(`--${varName}`).trim()
        return hslValue ? `hsl(${hslValue})` : 'hsl(215 16% 47%)' // fallback to status-todo
    }, [])

    // Получение цвета задачи по полю
    const getTaskColor = useCallback((task: any): string => {
        if (!task.details) return getCSSColor('status-todo')

        const fieldValue = (task.details as any)[colorField]

        // Handle arrays (components, labels)
        if (Array.isArray(fieldValue)) {
            const value = fieldValue[0]
            if (value) {
                const customColor = customColors.find(c => c.type === value)
                return customColor?.color || getCSSColor('status-todo')
            }
        } else if (fieldValue) {
            // Single value
            const customColor = customColors.find(c => c.type === fieldValue)
            return customColor?.color || getCSSColor('status-todo')
        }

        return getCSSColor('status-todo')
    }, [colorField, customColors, getCSSColor])

    return { getCSSColor, getTaskColor }
}
