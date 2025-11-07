import { useEffect, useRef } from 'react'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import { useGanttData, useJiraSync } from '@/hooks'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import type { ColorScheme, TimeScale } from './GanttSettings'

interface GanttVisualizationProps {
  colorScheme?: ColorScheme
  timeScale?: TimeScale
  readonly?: boolean
}

/**
 * DHTMLX Gantt Visualization (Presentational Component)
 * Вся логика данных вынесена в useGanttData и useJiraSync hooks
 */
export function GanttVisualization({
  colorScheme = 'type',
  timeScale = 'day',
  readonly = false,
}: GanttVisualizationProps) {
  const ganttContainer = useRef<HTMLDivElement>(null)
  const { ganttData, tasks, updateTask } = useGanttData()
  const { syncTasks, isSyncing } = useJiraSync()

  // Функция для получения цвета задачи
  const getTaskColor = (task: any): string => {
    if (colorScheme === 'type') {
      const colors: Record<string, string> = {
        'Epic': '#9333ea',
        'Story': '#3b82f6',
        'Task': '#10b981',
        'Bug': '#ef4444',
        'Sub-task': '#6366f1',
      }
      return colors[task.details?.issueType || ''] || '#6b7280'
    }
    else if (colorScheme === 'status') {
      const colors: Record<string, string> = {
        'To Do': '#6b7280',
        'In Progress': '#eab308',
        'Done': '#10b981',
        'Closed': '#3b82f6',
      }
      return colors[task.details?.status || ''] || '#6b7280'
    }
    else if (colorScheme === 'priority') {
      const colors: Record<string, string> = {
        'Highest': '#dc2626',
        'High': '#f97316',
        'Medium': '#eab308',
        'Low': '#3b82f6',
        'Lowest': '#6b7280',
      }
      return colors[task.details?.priority || ''] || '#6b7280'
    }
    else if (colorScheme === 'assignee' && task.details?.assignee) {
      const assignee = task.details.assignee
      const hash = assignee.split('').reduce((acc: number, char: string) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
      }, 0)
      const hue = Math.abs(hash) % 360
      return `hsl(${hue}, 65%, 50%)`
    }

    return '#6b7280'
  }

  // Initialize DHTMLX Gantt
  useEffect(() => {
    if (!ganttContainer.current) return

    // Базовая конфигурация
    gantt.config.date_format = '%Y-%m-%d %H:%i'
    gantt.config.readonly = readonly
    gantt.config.show_progress = true
    gantt.config.show_links = true
    gantt.config.drag_links = !readonly
    gantt.config.drag_progress = !readonly
    gantt.config.drag_resize = !readonly
    gantt.config.drag_move = !readonly

    // Настройка шкалы времени
    if (timeScale === 'day') {
      gantt.config.scales = [
        { unit: 'month', step: 1, format: '%F %Y' },
        { unit: 'day', step: 1, format: '%d' }
      ]
    } else if (timeScale === 'week') {
      gantt.config.scales = [
        { unit: 'month', step: 1, format: '%F %Y' },
        { unit: 'week', step: 1, format: 'Week #%W' }
      ]
    } else if (timeScale === 'month') {
      gantt.config.scales = [
        { unit: 'year', step: 1, format: '%Y' },
        { unit: 'month', step: 1, format: '%M' }
      ]
    } else if (timeScale === 'quarter') {
      gantt.config.scales = [
        { unit: 'year', step: 1, format: '%Y' },
        { unit: 'quarter', step: 1, format: 'Q%q' }
      ]
    }

    // Настройка колонок
    gantt.config.columns = [
      {
        name: 'text',
        label: 'Task',
        tree: true,
        width: 250,
        resize: true
      },
      {
        name: 'start_date',
        label: 'Start',
        align: 'center',
        width: 80,
        resize: true
      },
      {
        name: 'duration',
        label: 'Duration',
        align: 'center',
        width: 70,
        resize: true
      },
      {
        name: 'add',
        label: '',
        width: 44
      }
    ]

    // Применение цветовой схемы
    gantt.templates.task_class = (_start, _end, task) => {
      return task.details?.issueType === 'Epic' ? 'gantt-epic' : ''
    }

    gantt.templates.task_text = (_start, _end, task) => {
      return task.text
    }

    // Кастомизация цветов задач
    gantt.attachEvent('onBeforeTaskDisplay', (_id, _task) => {
      return true
    })

    // Инициализация Gantt
    gantt.init(ganttContainer.current)

    // Cleanup
    return () => {
      gantt.clearAll()
    }
  }, [timeScale, readonly])

  // Обработчик изменения задач (2-way sync)
  useEffect(() => {
    const handleAfterTaskDrag = (id: string, _mode: string, task: any) => {
      if (readonly) return

      updateTask(id, {
        start_date: task.start_date,
        end_date: task.end_date,
        progress: task.progress,
      })
    }

    const handleAfterTaskUpdate = (id: string, task: any) => {
      if (readonly) return

      updateTask(id, {
        start_date: task.start_date,
        end_date: task.end_date,
        progress: task.progress,
      })
    }

    gantt.attachEvent('onAfterTaskDrag', handleAfterTaskDrag)
    gantt.attachEvent('onAfterTaskUpdate', handleAfterTaskUpdate)

    return () => {
      gantt.detachEvent('onAfterTaskDrag')
      gantt.detachEvent('onAfterTaskUpdate')
    }
  }, [updateTask, readonly])

  // Загрузка данных в Gantt
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      gantt.clearAll()
      return
    }

    // Преобразуем данные в формат DHTMLX
    const ganttTasks = tasks
      .filter(task => {
        // Фильтруем задачи без валидных дат
        if (!task.start_date || !task.end_date) return false
        if (!(task.start_date instanceof Date) || !(task.end_date instanceof Date)) return false
        if (isNaN(task.start_date.getTime()) || isNaN(task.end_date.getTime())) return false
        return true
      })
      .map(task => {
        const color = getTaskColor(task)

        return {
          id: task.id,
          text: task.text,
          start_date: task.start_date,
          end_date: task.end_date,
          duration: Math.ceil((task.end_date.getTime() - task.start_date.getTime()) / (1000 * 60 * 60 * 24)),
          progress: task.progress || 0,
          parent: task.parent || 0,
          type: task.details?.issueType === 'Epic' ? gantt.config.types.project : gantt.config.types.task,
          color: color,
          details: task.details,
        }
      })

    // Очищаем и загружаем данные
    gantt.clearAll()
    gantt.parse({ data: ganttTasks, links: [] })

    // Автоматический zoom to fit
    if (ganttTasks.length > 0) {
      gantt.render()
    }
  }, [tasks, colorScheme])

  // Если нет данных
  if (!ganttData || !tasks || tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
        <div className="text-center space-y-4">
          <p className="text-lg font-medium text-muted-foreground">
            No tasks to display
          </p>
          <p className="text-sm text-muted-foreground">
            Sync tasks from JIRA to visualize in Gantt chart
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Sync Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {tasks.length} tasks
        </div>
        <Button
          onClick={() => syncTasks()}
          disabled={isSyncing}
          variant="outline"
          size="sm"
        >
          {isSyncing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {isSyncing ? 'Syncing...' : 'Refresh from JIRA'}
        </Button>
      </div>

      {/* DHTMLX Gantt Container */}
      <div
        ref={ganttContainer}
        className="border rounded-lg bg-background overflow-hidden gantt-container"
        style={{ height: '600px', width: '100%' }}
      />

      {/* Custom CSS for Gantt */}
      <style>{`
        .gantt-container .gantt_task_line {
          border-radius: 4px;
        }
        .gantt-epic .gantt_task_line {
          font-weight: 600;
          border: 2px solid rgba(0, 0, 0, 0.1);
        }
        .gantt_grid_head_cell,
        .gantt_grid_data .gantt_cell {
          color: var(--foreground);
        }
        .gantt_task .gantt_task_scale .gantt_scale_cell {
          color: var(--foreground);
        }
        .gantt_grid {
          background: var(--background);
          border-right: 1px solid var(--border);
        }
        .gantt_task {
          background: var(--background);
        }
        .gantt_task_row,
        .gantt_grid_data .gantt_row {
          border-bottom: 1px solid var(--border);
        }
        .gantt_grid_head_cell {
          border-right: 1px solid var(--border);
          background: var(--muted);
        }
        .gantt_scale_cell {
          border-right: 1px solid var(--border);
        }
      `}</style>
    </div>
  )
}
