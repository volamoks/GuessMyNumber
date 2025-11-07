import { useEffect, useRef, useCallback, useState } from 'react'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import { useGanttData, useJiraSync } from '@/hooks'
import { useGanttStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Maximize2, Minimize2 } from 'lucide-react'
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
  const store = useGanttStore()
  const { ganttData, tasks, updateTask } = useGanttData()
  const { syncTasks, isSyncing } = useJiraSync()
  const [viewLevel, setViewLevel] = useState<string>('all')

  // Функции для управления деревом
  const handleExpandAll = useCallback(() => {
    gantt.eachTask((task) => {
      task.$open = true
    })
    gantt.render()
  }, [])

  const handleCollapseAll = useCallback(() => {
    gantt.eachTask((task) => {
      task.$open = false
    })
    gantt.render()
  }, [])

  // Иерархическое сворачивание по уровням
  const handleViewLevelChange = useCallback((level: string) => {
    setViewLevel(level)

    gantt.eachTask((task) => {
      const issueType = task.details?.issueType

      switch(level) {
        case 'epics':
          // Показываем только Epics
          task.$open = false
          break
        case 'epics-stories':
          // Epics раскрыты, Stories видны но свернуты
          if (issueType === 'Epic') {
            task.$open = true
          } else {
            task.$open = false
          }
          break
        case 'epics-stories-tasks':
          // Epics и Stories раскрыты, Tasks видны
          if (issueType === 'Epic' || issueType === 'Story') {
            task.$open = true
          } else {
            task.$open = false
          }
          break
        case 'all':
          // Все раскрыто
          task.$open = true
          break
        default:
          task.$open = false
      }
    })

    gantt.render()
  }, [])

  // Функция для получения цвета задачи
  const getTaskColor = (task: any): string => {
    if (colorScheme === 'type') {
      // Используем кастомные цвета из store
      const customColor = store.customColors.find(c => c.type === task.details?.issueType)
      if (customColor) {
        return customColor.color
      }
      return '#6b7280' // Default gray
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
    gantt.config.autosize = false // Отключаем autosize для фиксированной ширины
    gantt.config.fit_tasks = true // Автоматически подгонять таймлайн под задачи

    // Настройка шкалы времени
    if (timeScale === 'day') {
      gantt.config.scales = [
        { unit: 'month', step: 1, format: '%F %Y' },
        { unit: 'day', step: 1, format: '%d' }
      ]
      gantt.config.scale_height = 50
    } else if (timeScale === 'week') {
      gantt.config.scales = [
        { unit: 'month', step: 1, format: '%F %Y' },
        { unit: 'week', step: 1, format: 'Week #%W' }
      ]
      gantt.config.scale_height = 50
    } else if (timeScale === 'month') {
      gantt.config.scales = [
        { unit: 'year', step: 1, format: '%Y' },
        { unit: 'month', step: 1, format: '%M' }
      ]
      gantt.config.scale_height = 50
    } else if (timeScale === 'quarter') {
      gantt.config.scales = [
        { unit: 'year', step: 1, format: '%Y' },
        { unit: 'quarter', step: 1, format: 'Q%q' }
      ]
      gantt.config.scale_height = 50
    }

    // Настройка колонок - используем кастомные колонки из store
    const visibleColumns = store.columns
      .filter(col => col.visible)
      .map(col => ({
        name: col.name,
        label: col.label,
        tree: col.id === 'text', // Только первая колонка с деревом
        width: col.width,
        resize: col.resize,
        align: col.align
      }))

    // Добавляем колонку "add" в конец если не readonly
    if (!readonly) {
      visibleColumns.push({
        name: 'add',
        label: '',
        tree: false,
        width: 44,
        resize: false,
        align: 'center'
      })
    }

    gantt.config.columns = visibleColumns as any

    // Применение цветовой схемы через template
    gantt.templates.task_class = (_start, _end, task) => {
      const issueType = task.details?.issueType
      if (issueType === 'Epic') return 'gantt-epic'
      if (issueType === 'Story') return 'gantt-story'
      if (issueType === 'Bug') return 'gantt-bug'
      if (issueType === 'Task') return 'gantt-task'
      if (issueType === 'Sub-task') return 'gantt-subtask'
      return ''
    }

    gantt.templates.task_text = (_start, _end, task) => {
      return task.text
    }

    // Применение цветов напрямую к задачам
    gantt.templates.task_unscheduled_time = (_task) => {
      return ''
    }

    // Инициализация Gantt
    gantt.init(ganttContainer.current)

    // Cleanup
    return () => {
      gantt.clearAll()
    }
  }, [timeScale, readonly, colorScheme, store.columns, store.customColors])

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
      {/* Header with Control Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-muted-foreground">
          Showing {tasks.length} tasks
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* View Level Select */}
          <Select value={viewLevel} onValueChange={handleViewLevelChange}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue placeholder="View level..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="epics">📦 Epics Only</SelectItem>
              <SelectItem value="epics-stories">📦 Epics + 📖 Stories</SelectItem>
              <SelectItem value="epics-stories-tasks">📦 Epics + 📖 Stories + ✓ Tasks</SelectItem>
              <SelectItem value="all">🌳 Show All (with Subtasks)</SelectItem>
            </SelectContent>
          </Select>

          {/* Import Button */}
          <Button
            onClick={() => syncTasks()}
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isSyncing ? 'Importing...' : 'Import'}
          </Button>

          {/* Expand/Collapse Buttons */}
          <Button
            onClick={handleExpandAll}
            variant="outline"
            size="sm"
            title="Expand all tasks"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleCollapseAll}
            variant="outline"
            size="sm"
            title="Collapse all tasks"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* DHTMLX Gantt Container */}
      <div
        ref={ganttContainer}
        className="border rounded-lg bg-background overflow-hidden gantt-container"
        style={{ height: '600px', width: '100%' }}
      />

      {/* Custom CSS for Gantt */}
      <style>{`
        /* Горизонтальный скролл */
        .gantt-container {
          overflow-x: auto !important;
          overflow-y: auto !important;
        }

        /* Базовые стили задач */
        .gantt-container .gantt_task_line {
          border-radius: 4px;
          transition: opacity 0.2s;
        }

        .gantt-container .gantt_task_line:hover {
          opacity: 0.9;
        }

        /* Цвета для разных типов задач */
        .gantt-epic .gantt_task_line {
          background-color: #9333ea !important;
          border: 2px solid #7e22ce;
          font-weight: 600;
        }
        .gantt-epic .gantt_task_progress {
          background-color: #7e22ce !important;
        }

        .gantt-story .gantt_task_line {
          background-color: #3b82f6 !important;
          border: 1px solid #2563eb;
        }
        .gantt-story .gantt_task_progress {
          background-color: #2563eb !important;
        }

        .gantt-task .gantt_task_line {
          background-color: #10b981 !important;
          border: 1px solid #059669;
        }
        .gantt-task .gantt_task_progress {
          background-color: #059669 !important;
        }

        .gantt-bug .gantt_task_line {
          background-color: #ef4444 !important;
          border: 1px solid #dc2626;
        }
        .gantt-bug .gantt_task_progress {
          background-color: #dc2626 !important;
        }

        .gantt-subtask .gantt_task_line {
          background-color: #6366f1 !important;
          border: 1px solid #4f46e5;
        }
        .gantt-subtask .gantt_task_progress {
          background-color: #4f46e5 !important;
        }

        /* Темная тема совместимость */
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
