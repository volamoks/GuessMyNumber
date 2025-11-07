import { useState, useCallback } from 'react'
import { jiraService } from '@/lib/jira-service'
import { useGanttStore } from '@/store'
import { toast } from 'sonner'

/**
 * Custom hook для синхронизации задач из JIRA
 * Поддержка множественных проектов для портфельного анализа
 */
export function useJiraSync() {
  const store = useGanttStore()
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string>('')

  /**
   * Синхронизация задач из JIRA (поддержка множественных проектов)
   */
  const syncTasks = useCallback(async (projectKey?: string) => {
    // Используем выбранные проекты из store или переданный projectKey
    const projectsToSync = projectKey
      ? [projectKey]
      : store.selectedProjectKeys.length > 0
        ? store.selectedProjectKeys
        : store.selectedProjectKey
          ? [store.selectedProjectKey]
          : []

    if (projectsToSync.length === 0) {
      const message = 'Please select at least one project first'
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
      let allTasks: any[] = []

      // Fetch issues from all selected projects
      for (const projKey of projectsToSync) {
        const issues = await jiraService.fetchIssues({
          projectKey: projKey,
          maxResults: 100,
        })

        const tasks = jiraService.transformToGanttTasks(issues)
        allTasks = [...allTasks, ...tasks]
      }

      // Apply filters if any
      let filteredTasks = allTasks

      if (store.filters.issueTypes && store.filters.issueTypes.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          store.filters.issueTypes?.includes(task.details?.issueType || '')
        )
      }

      if (store.filters.statuses && store.filters.statuses.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          store.filters.statuses?.includes(task.details?.status || '')
        )
      }

      if (store.filters.priorities && store.filters.priorities.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          store.filters.priorities?.includes(task.details?.priority || '')
        )
      }

      // Update store
      const ganttData = {
        title: projectsToSync.length === 1
          ? `Project: ${projectsToSync[0]}`
          : `Portfolio: ${projectsToSync.length} projects`,
        description: `${filteredTasks.length} tasks from JIRA${store.filters.issueTypes || store.filters.statuses || store.filters.priorities ? ' (filtered)' : ''}`,
        tasks: filteredTasks,
        lastSync: new Date(),
      }

      store.setData(ganttData)

      const filterInfo = store.filters.issueTypes || store.filters.statuses || store.filters.priorities
        ? ` (${allTasks.length - filteredTasks.length} filtered out)`
        : ''

      toast.success(
        `Synced ${filteredTasks.length} tasks from ${projectsToSync.length} project(s)${filterInfo}`
      )
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
