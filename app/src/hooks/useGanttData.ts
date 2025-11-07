import { useCallback } from 'react'
import { useGanttStore } from '@/store'
import { jiraService } from '@/lib/jira-service'
import { toast } from 'sonner'
import type { GanttTask } from '@/lib/jira-types'

/**
 * Custom hook для работы с данными Gantt
 * Управляет задачами, обновлениями, и синхронизацией обратно в JIRA
 */
export function useGanttData() {
  const store = useGanttStore()

  /**
   * Обновление задачи
   */
  const updateTask = useCallback(async (taskId: string, updates: Partial<GanttTask>) => {
    if (!store.data) return false

    try {
      // Обновляем в JIRA (2-way sync)
      if (updates.start_date || updates.end_date) {
        await jiraService.updateIssue(taskId, {
          startDate: updates.start_date?.toISOString().split('T')[0],
          dueDate: updates.end_date?.toISOString().split('T')[0],
        })
      }

      // Обновляем в локальном store
      const updatedTasks = store.data.tasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )

      store.setData({
        ...store.data,
        tasks: updatedTasks,
      })

      toast.success(`Updated ${taskId}`)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update task'
      console.error('Failed to update task:', err)
      toast.error(message)
      return false
    }
  }, [store])

  /**
   * Получение задачи по ID
   */
  const getTask = useCallback((taskId: string) => {
    if (!store.data) return null
    return store.data.tasks.find(task => task.id === taskId) || null
  }, [store.data])

  /**
   * Получение подзадач для задачи
   */
  const getSubtasks = useCallback((parentId: string) => {
    if (!store.data) return []
    return store.data.tasks.filter(task => task.parent === parentId)
  }, [store.data])

  /**
   * Получение всех задач верхнего уровня (без родителя)
   */
  const getRootTasks = useCallback(() => {
    if (!store.data) return []
    return store.data.tasks.filter(task => !task.parent)
  }, [store.data])

  return {
    // State
    ganttData: store.data,
    tasks: store.data?.tasks || [],
    isSyncing: store.isSyncing,

    // Actions
    updateTask,
    getTask,
    getSubtasks,
    getRootTasks,
  }
}
