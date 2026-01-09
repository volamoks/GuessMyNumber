import { useCallback } from 'react'
import { useGanttStore } from '@/features/jira-gantt/store/ganttStore'
import { jiraService } from '@/features/jira-gantt/services/jira-service'
import { toast } from 'sonner'
import type { GanttTask } from '@/features/jira-gantt/types'

/**
 * Custom hook для работы с данными Gantt
 * Управляет задачами, обновлениями, и синхронизацией обратно в JIRA
 */
export function useGanttData() {
  const store = useGanttStore()

  /**
   * Обновление задачи локально (без синхронизации с JIRA)
   */
  const updateTask = useCallback((taskId: string, updates: Partial<GanttTask>) => {
    if (!store.data) return false

    try {
      // Обновляем в локальном store
      const updatedTasks = store.data.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )

      store.setData({
        ...store.data,
        tasks: updatedTasks,
      })

      // Отмечаем задачу как измененную
      store.markTaskAsModified(taskId)

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      console.error('Failed to update task:', err)
      toast.error(message)
      return false
    }
  }, [store])

  /**
   * Экспорт изменений обратно в JIRA
   */
  const exportToJira = useCallback(async () => {
    const modifiedTaskIds = Array.from(store.modifiedTasks)

    if (modifiedTaskIds.length === 0) {
      toast.info('No modified tasks to export')
      return { success: 0, failed: 0 }
    }

    store.setExporting(true)
    let successCount = 0
    let failedCount = 0

    try {
      for (const taskId of modifiedTaskIds) {
        const task = store.data?.tasks.find((t: GanttTask) => t.id === taskId)
        if (!task) continue

        try {
          await jiraService.updateIssue(taskId, {
            startDate: task.start_date?.toISOString().split('T')[0],
            dueDate: task.end_date?.toISOString().split('T')[0],
          })
          successCount++
        } catch (err) {
          console.error(`Failed to export task ${taskId}:`, err)
          failedCount++
        }
      }

      // Очищаем список измененных задач после успешного экспорта
      if (successCount > 0) {
        store.clearModifiedTasks()
        toast.success(`Exported ${successCount} task(s) to JIRA`)
      }

      if (failedCount > 0) {
        toast.error(`Failed to export ${failedCount} task(s)`)
      }

      return { success: successCount, failed: failedCount }
    } finally {
      store.setExporting(false)
    }
  }, [store])

  /**
   * Получение задачи по ID
   */
  const getTask = useCallback((taskId: string) => {
    if (!store.data) return null
    return store.data.tasks.find((task: GanttTask) => task.id === taskId) || null
  }, [store.data])

  /**
   * Получение подзадач для задачи
   */
  const getSubtasks = useCallback((parentId: string) => {
    if (!store.data) return []
    return store.data.tasks.filter((task: GanttTask) => task.parent === parentId)
  }, [store.data])

  /**
   * Получение всех задач верхнего уровня (без родителя)
   */
  const getRootTasks = useCallback(() => {
    if (!store.data) return []
    return store.data.tasks.filter((task: GanttTask) => !task.parent)
  }, [store.data])

  return {
    // State
    ganttData: store.data,
    tasks: store.data?.tasks || [],
    isSyncing: store.isSyncing,
    isExporting: store.isExporting,
    modifiedTasksCount: store.modifiedTasks.size,

    // Actions
    updateTask,
    exportToJira,
    getTask,
    getSubtasks,
    getRootTasks,
  }
}
