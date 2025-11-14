import { useEffect, useRef, useCallback, useState } from 'react'
import { gantt } from 'dhtmlx-gantt'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import { useGanttData } from '@/hooks'
import { useGanttStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Maximize2, Minimize2 } from 'lucide-react'
import { ColumnSettingsDialog } from './ColumnSettingsDialog'
import { ColorSchemeDialog } from './ColorSchemeDialog'
import type { TimeScale } from './types'

interface GanttVisualizationProps {
  readonly?: boolean
}

/**
 * DHTMLX Gantt Visualization (Presentational Component)
 * All controls in header - compact and clean
 */
export function GanttVisualization({ readonly = false }: GanttVisualizationProps) {
  const ganttContainer = useRef<HTMLDivElement>(null)
  const store = useGanttStore()
  const { ganttData, tasks, updateTask } = useGanttData()
  const [viewLevel, setViewLevel] = useState<string>('all')
  const [timeScale, setTimeScale] = useState<TimeScale>('day')
  const [colorField, setColorField] = useState<string>('issueType')

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

  // Get CSS variable color value
  const getCSSColor = (varName: string): string => {
    const root = document.documentElement
    const hslValue = getComputedStyle(root).getPropertyValue(`--${varName}`).trim()
    return hslValue ? `hsl(${hslValue})` : 'hsl(215 16% 47%)' // fallback to status-todo
  }

  // Функция для получения цвета задачи по любому полю
  const getTaskColor = (task: any): string => {
    if (!task.details) return getCSSColor('status-todo')

    const fieldValue = (task.details as any)[colorField]

    // Handle arrays (components, labels)
    if (Array.isArray(fieldValue)) {
      // Use first value for color
      const value = fieldValue[0]
      if (value) {
        const customColor = store.customColors.find(c => c.type === value)
        return customColor?.color || getCSSColor('status-todo')
      }
    } else if (fieldValue) {
      // Single value
      const customColor = store.customColors.find(c => c.type === fieldValue)
      return customColor?.color || getCSSColor('status-todo')
    }

    return getCSSColor('status-todo') // Default gray
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
    gantt.config.autosize = 'y' // Auto height based on tasks
    gantt.config.fit_tasks = true // Автоматически подгонять таймлайн под задачи

    // Smart drag-drop: only within same parent
    gantt.config.order_branch = true
    gantt.config.order_branch_free = false

    // Enable column resizing
    gantt.config.grid_resize = true // Enable grid resizing
    gantt.config.min_column_width = 50 // Minimum column width

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
      .map(col => {
        // Базовая конфигурация колонки
        const columnConfig: any = {
          name: col.name,
          label: col.label,
          tree: col.id === 'text', // Только первая колонка с деревом
          width: col.width,
          resize: col.resize,
          align: col.align
        }

        // Добавляем template для кастомных полей из task.details
        switch(col.id) {
          case 'key':
            columnConfig.template = (task: any) => task.details?.key || ''
            break
          case 'assignee':
            columnConfig.template = (task: any) => task.details?.assignee || ''
            break
          case 'reporter':
            columnConfig.template = (task: any) => task.details?.reporter || ''
            break
          case 'priority':
            columnConfig.template = (task: any) => task.details?.priority || ''
            break
          case 'status':
            columnConfig.template = (task: any) => task.details?.status || ''
            break
          case 'issueType':
            columnConfig.template = (task: any) => {
              const issueType = task.details?.issueType || ''
              if (!issueType) return ''

              // Get color for this issue type
              const color = getTaskColor(task)

              // Return HTML with colored background
              return `<div style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 4px; text-align: center; font-weight: 500; display: inline-block; min-width: 80px;">${issueType}</div>`
            }
            break
          case 'labels':
            columnConfig.template = (task: any) => {
              const labels = task.details?.labels || []
              return Array.isArray(labels) ? labels.join(', ') : ''
            }
            break
          case 'components':
            columnConfig.template = (task: any) => {
              console.log(`Components for ${task.id}:`, task.details?.components)
              const components = task.details?.components || []
              return Array.isArray(components) ? components.join(', ') : ''
            }
            break
          case 'description':
            columnConfig.template = (task: any) => {
              const desc = task.details?.description || ''
              return desc.length > 50 ? desc.substring(0, 50) + '...' : desc
            }
            break
          case 'epic':
            columnConfig.template = (task: any) => task.details?.epic || ''
            break
          case 'sprint':
            columnConfig.template = (task: any) => task.details?.sprint || ''
            break
          case 'resolution':
            columnConfig.template = (task: any) => task.details?.resolution || ''
            break
          case 'estimatedHours':
            columnConfig.template = (task: any) => {
              const hours = task.details?.estimatedHours
              return hours !== null && hours !== undefined ? `${hours}h` : ''
            }
            break
          case 'remainingHours':
            columnConfig.template = (task: any) => {
              const hours = task.details?.remainingHours
              return hours !== null && hours !== undefined ? `${hours}h` : ''
            }
            break
          case 'createdDate':
            columnConfig.template = (task: any) => {
              const date = task.details?.createdDate
              return date ? new Date(date).toLocaleDateString() : ''
            }
            break
          case 'updatedDate':
            columnConfig.template = (task: any) => {
              const date = task.details?.updatedDate
              return date ? new Date(date).toLocaleDateString() : ''
            }
            break
          case 'progress':
            columnConfig.template = (task: any) => {
              const progress = task.progress || 0
              return `${Math.round(progress * 100)}%`
            }
            break
          // For standard fields (text, start_date, end_date, duration), DHTMLX handles them automatically
        }

        return columnConfig
      })

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
  }, [timeScale, readonly, colorField, store.columns, store.customColors])

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

    console.log('Total tasks before filter:', tasks.length)

    // Преобразуем данные в формат DHTMLX
    const ganttTasks = tasks
      .filter(task => {
        // Фильтруем задачи без валидных дат
        if (!task.start_date || !task.end_date) {
          console.log('Filtered out (no dates):', task.id, task.text)
          return false
        }
        if (!(task.start_date instanceof Date) || !(task.end_date instanceof Date)) {
          console.log('Filtered out (not Date):', task.id, task.text, typeof task.start_date, typeof task.end_date)
          return false
        }
        if (isNaN(task.start_date.getTime()) || isNaN(task.end_date.getTime())) {
          console.log('Filtered out (invalid Date):', task.id, task.text)
          return false
        }
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

    console.log('Gantt tasks after filter:', ganttTasks.length, ganttTasks)

    // Очищаем и загружаем данные
    gantt.clearAll()
    gantt.parse({ data: ganttTasks, links: [] })

    // Автоматический zoom to fit
    if (ganttTasks.length > 0) {
      gantt.render()
    }
  }, [tasks, colorField, store.customColors])

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
      {/* Header with All Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-muted-foreground">
          {tasks.length} tasks
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

          {/* Timeline Scale */}
          <Select value={timeScale} onValueChange={(val) => setTimeScale(val as TimeScale)}>
            <SelectTrigger className="w-[120px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="quarter">Quarter</SelectItem>
            </SelectContent>
          </Select>

          {/* Column Settings */}
          <ColumnSettingsDialog
            columns={store.columns}
            onColumnsChange={store.setColumns}
          />

          {/* Color Scheme */}
          <ColorSchemeDialog
            colorField={colorField}
            onColorFieldChange={setColorField}
            colors={store.customColors}
            onColorsChange={store.setCustomColors}
          />

          {/* Expand/Collapse Buttons */}
          <Button
            onClick={handleExpandAll}
            variant="outline"
            size="sm"
            title="Expand all"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleCollapseAll}
            variant="outline"
            size="sm"
            title="Collapse all"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* DHTMLX Gantt Container */}
      <div
        ref={ganttContainer}
        className="border rounded-lg bg-background overflow-hidden gantt-container"
        style={{ minHeight: '70vh', width: '100%' }}
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

        /* Цвета для разных типов задач - using semantic CSS variables */
        .gantt-epic .gantt_task_line {
          background-color: hsl(var(--issue-epic)) !important;
          border: 2px solid hsl(var(--issue-epic) / 0.8);
          font-weight: 600;
        }
        .gantt-epic .gantt_task_progress {
          background-color: hsl(var(--issue-epic) / 0.8) !important;
        }

        .gantt-story .gantt_task_line {
          background-color: hsl(var(--issue-story)) !important;
          border: 1px solid hsl(var(--issue-story) / 0.8);
        }
        .gantt-story .gantt_task_progress {
          background-color: hsl(var(--issue-story) / 0.8) !important;
        }

        .gantt-task .gantt_task_line {
          background-color: hsl(var(--issue-task)) !important;
          border: 1px solid hsl(var(--issue-task) / 0.8);
        }
        .gantt-task .gantt_task_progress {
          background-color: hsl(var(--issue-task) / 0.8) !important;
        }

        .gantt-bug .gantt_task_line {
          background-color: hsl(var(--issue-bug)) !important;
          border: 1px solid hsl(var(--issue-bug) / 0.8);
        }
        .gantt-bug .gantt_task_progress {
          background-color: hsl(var(--issue-bug) / 0.8) !important;
        }

        .gantt-subtask .gantt_task_line {
          background-color: hsl(var(--issue-subtask)) !important;
          border: 1px solid hsl(var(--issue-subtask) / 0.8);
        }
        .gantt-subtask .gantt_task_progress {
          background-color: hsl(var(--issue-subtask) / 0.8) !important;
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
