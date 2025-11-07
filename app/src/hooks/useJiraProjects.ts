import { useState, useCallback, useRef } from 'react'
import { jiraService } from '@/lib/jira-service'
import { useGanttStore } from '@/store'

/**
 * Custom hook для работы с проектами JIRA
 * Загружает список проектов и управляет выбранным проектом
 */
export function useJiraProjects() {
  const store = useGanttStore()
  const [projects, setProjects] = useState<Array<{ key: string; name: string; id?: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const hasLoadedProjects = useRef(false)

  /**
   * Загрузка списка проектов из JIRA
   */
  const loadProjects = useCallback(async () => {
    if (!store.connectionStatus.connected) {
      setError('Not connected to JIRA')
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const projectsList = await jiraService.getProjects()
      setProjects(projectsList)
      return projectsList
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects'
      setError(message)
      console.error('Failed to load projects:', err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [store.connectionStatus.connected])

  /**
   * Автоматическая загрузка проектов при подключении
   */
  const autoLoadProjects = useCallback(async () => {
    if (store.connectionStatus.connected && !hasLoadedProjects.current) {
      hasLoadedProjects.current = true
      await loadProjects()
    }
  }, [store.connectionStatus.connected, loadProjects])

  /**
   * Выбор проекта
   */
  const selectProject = useCallback((projectKey: string) => {
    store.setSelectedProjectKey(projectKey)
  }, [store])

  /**
   * Получение выбранного проекта
   */
  const getSelectedProject = useCallback(() => {
    if (!store.selectedProjectKey) return null
    return projects.find(p => p.key === store.selectedProjectKey) || null
  }, [store.selectedProjectKey, projects])

  return {
    // State
    projects,
    isLoading,
    error,
    selectedProjectKey: store.selectedProjectKey,
    selectedProject: getSelectedProject(),

    // Actions
    loadProjects,
    autoLoadProjects,
    selectProject,
  }
}
