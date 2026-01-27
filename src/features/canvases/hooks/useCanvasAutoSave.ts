import { useState, useEffect } from 'react'
import { useProjectStore } from '@/store/projectStore'

export function useCanvasAutoSave<T>(data: T | null) {
    const [lastSavedData, setLastSavedData] = useState<T | null>(null)
    const [isAutoSaving, setIsAutoSaving] = useState(false)
    const currentProjectId = useProjectStore(state => state.currentProjectId)
    const saveProject = useProjectStore(state => state.saveProject)

    useEffect(() => {
        if (data && !lastSavedData) {
            setLastSavedData(data)
        }
    }, [data, lastSavedData])

    useEffect(() => {
        if (!data || !currentProjectId || !lastSavedData) return
        if (JSON.stringify(data) === JSON.stringify(lastSavedData)) return

        const timer = setTimeout(async () => {
            setIsAutoSaving(true)
            await saveProject(data, true)
            setLastSavedData(data)
            setIsAutoSaving(false)
        }, 1000)

        return () => clearTimeout(timer)
    }, [data, currentProjectId, lastSavedData, saveProject])

    return { isAutoSaving, lastSavedData, setLastSavedData }
}
