import { useMemo } from 'react'
import { Gantt, ViewMode } from 'gantt-task-react'
import type { Task } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import type { GanttData } from '@/store'
import type { ColorScheme, TimeScale } from './GanttSettings'

interface GanttVisualizationProps {
  data: GanttData
  onTaskUpdate?: (taskId: string, updates: any) => void
  readonly?: boolean
  colorScheme?: ColorScheme
  timeScale?: TimeScale
}

export function GanttVisualization({
  data,
  onTaskUpdate,
  readonly = false,
  colorScheme = 'type',
  timeScale = 'day',
}: GanttVisualizationProps) {

  // Функция для получения цвета задачи
  const getTaskColors = (issueType?: string, status?: string, priority?: string, assignee?: string) => {
    let baseColor = '#6b7280' // default gray

    if (colorScheme === 'type') {
      const colors: Record<string, string> = {
        'Epic': '#9333ea',
        'Story': '#3b82f6',
        'Task': '#10b981',
        'Bug': '#ef4444',
        'Sub-task': '#6366f1',
      }
      baseColor = colors[issueType || ''] || '#6b7280'
    }
    else if (colorScheme === 'status') {
      const colors: Record<string, string> = {
        'To Do': '#6b7280',
        'In Progress': '#eab308',
        'Done': '#10b981',
        'Closed': '#3b82f6',
      }
      baseColor = colors[status || ''] || '#6b7280'
    }
    else if (colorScheme === 'priority') {
      const colors: Record<string, string> = {
        'Highest': '#dc2626',
        'High': '#f97316',
        'Medium': '#eab308',
        'Low': '#3b82f6',
        'Lowest': '#6b7280',
      }
      baseColor = colors[priority || ''] || '#6b7280'
    }
    else if (colorScheme === 'assignee' && assignee) {
      const hash = assignee.split('').reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
      }, 0)
      const hue = Math.abs(hash) % 360
      baseColor = `hsl(${hue}, 65%, 50%)`
    }

    return {
      backgroundColor: baseColor,
      backgroundSelectedColor: baseColor,
      progressColor: baseColor,
      progressSelectedColor: baseColor,
    }
  }

  // Преобразуем данные в формат gantt-task-react
  const ganttTasks: Task[] = useMemo(() => {
    if (!data?.tasks) return []

    return data.tasks
      .filter(task => {
        // Убираем задачи без валидных дат
        if (!task.start_date || !task.end_date) return false
        if (!(task.start_date instanceof Date) || !(task.end_date instanceof Date)) return false
        if (isNaN(task.start_date.getTime()) || isNaN(task.end_date.getTime())) return false
        return true
      })
      .map(task => {
        const colors = getTaskColors(
          task.details?.issueType,
          task.details?.status,
          task.details?.priority,
          task.details?.assignee
        )

        return {
          start: new Date(task.start_date),
          end: new Date(task.end_date),
          name: task.text,
          id: task.id,
          type: task.type === 'project' ? 'project' : 'task',
          progress: Math.min(100, Math.max(0, task.progress * 100)),
          isDisabled: readonly,
          project: task.parent,
          dependencies: [],
          styles: colors,
        } as Task
      })
  }, [data?.tasks, colorScheme, readonly])

  // ViewMode из timeScale
  const viewMode = useMemo(() => {
    switch (timeScale) {
      case 'day': return ViewMode.Day
      case 'week': return ViewMode.Week
      case 'month': return ViewMode.Month
      case 'quarter': return ViewMode.QuarterYear
      default: return ViewMode.Day
    }
  }, [timeScale])

  // Column width по масштабу
  const columnWidth = useMemo(() => {
    switch (timeScale) {
      case 'day': return 60
      case 'week': return 100
      case 'month': return 120
      case 'quarter': return 150
      default: return 60
    }
  }, [timeScale])

  // Обработка изменений
  const handleDateChange = (task: Task) => {
    if (onTaskUpdate && !readonly) {
      onTaskUpdate(task.id, {
        start_date: task.start,
        end_date: task.end,
        progress: task.progress / 100,
      })
    }
  }

  const handleProgressChange = (task: Task) => {
    if (onTaskUpdate && !readonly) {
      onTaskUpdate(task.id, {
        progress: task.progress / 100,
      })
    }
  }

  // Если нет задач
  if (!ganttTasks || ganttTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">
            Нет задач для отображения
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Синхронизируйте задачи из JIRA
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Показано задач: {ganttTasks.length}
      </div>

      <div className="border rounded-lg bg-background overflow-hidden" style={{ height: '600px' }}>
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          onDateChange={handleDateChange}
          onProgressChange={handleProgressChange}
          listCellWidth="250px"
          columnWidth={columnWidth}
        />
      </div>
    </div>
  )
}
