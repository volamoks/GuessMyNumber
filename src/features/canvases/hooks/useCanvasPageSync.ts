import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'

export function useCanvasPageSync<T>(data: T | null) {
    const [searchParams, setSearchParams] = useSearchParams()

    const currentProjectId = useProjectStore(state => state.currentProjectId)
    const setCurrentProjectId = useProjectStore(state => state.setCurrentProjectId)
    const loadProject = useProjectStore(state => state.loadProject)
    const isLoading = useProjectStore(state => state.isLoading)
    const error = useProjectStore(state => state.error)

    useEffect(() => {
        const urlProjectId = searchParams.get('projectId')

        if (urlProjectId && urlProjectId !== currentProjectId) {
            setCurrentProjectId(urlProjectId)
            loadProject(urlProjectId)
        } else if (!urlProjectId && currentProjectId) {
            setSearchParams({ projectId: currentProjectId }, { replace: true })
            if (!data) loadProject(currentProjectId)
        } else if (currentProjectId && !data && !isLoading && !error) {
            loadProject(currentProjectId)
        }
    }, [searchParams, currentProjectId, loadProject, setSearchParams, data, isLoading, error, setCurrentProjectId])
}
