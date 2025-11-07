import { useState, useCallback } from 'react'
import { jiraService } from '@/lib/jira-service'
import { useGanttStore } from '@/store'
import { toast } from 'sonner'

/**
 * Custom hook для синхронизации задач из JIRA
 * Загружает задачи и трансформирует их в Gantt формат
 */
export function useJiraSync() {
  const store = useGanttStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string>('')

  /**
   * Синхронизация задач из JIRA
   */
  const syncTasks = useCallback(async (projectKey?: string) => {
    const projectToSync = projectKey || store.selectedProjectKey

    if (!projectToSync) {
      const message = 'Please select a project first'
      setError(message)
      toast.error(message)
      return null
    }

    if (!store.connectionStatus.connected) {
      const message = 'Not connected to JIRA'
      setError(message)
      toast.error(message)
      return null
    }

    setIsSyncing(true)
    store.setSyncing(true)
    setError('')

    try {
      // Fetch issues from JIRA
      const issues = await jiraService.fetchIssues({
        projectKey: projectToSync,
        maxResults: 100,
      })

      // Transform to Gantt tasks
      const tasks = jiraService.transformToGanttTasks(issues)

      // Update store
      const ganttData = {
        title: `Project: ${projectToSync}`,
        description: `${tasks.length} tasks from JIRA`,
        tasks,
        lastSync: new Date(),
      }

      store.setData(ganttData)

      toast.success(`Synced ${tasks.length} tasks from JIRA`)
      return ganttData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sync with JIRA'
      setError(message)
      console.error('Sync failed:', err)
      toast.error(message)
      return null
    } finally {
      setIsSyncing(false)
      store.setSyncing(false)
    }
  }, [store])

  /**
   * Проверка нужна ли синхронизация
   */
  const needsSync = useCallback(() => {
    if (!store.data) return true
    if (!store.data.lastSync) return true

    // Синхронизация нужна если прошло больше 5 минут
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    return new Date(store.data.lastSync) < fiveMinutesAgo
  }, [store.data])

  return {
    // State
    isSyncing,
    error,
    lastSync: store.data?.lastSync,
    tasksCount: store.data?.tasks?.length || 0,

    // Actions
    syncTasks,
    needsSync,
  }
}
