import { useEffect, useCallback } from 'react'
import type { RefObject } from 'react'
import { gantt } from 'dhtmlx-gantt'
import type { TimeScale, GanttColumn, TaskTypeColor } from '@/components/gantt/types'

interface UseGanttConfigParams {
  containerRef: RefObject<HTMLDivElement | null>
  timeScale: TimeScale
  colorField: string
  readonly: boolean
  columns: GanttColumn[]
  customColors: TaskTypeColor[]
  tasks: any[]
  onTaskUpdate?: (id: string, updates: any) => void
}

/**
 * useGanttConfig - Hook для конфигурации DHTMLX Gantt
 * Инкапсулирует всю бизнес-логику конфигурации gantt:
 * - Настройка шкалы времени
 * - Конфигурация колонок
 * - Цветовые схемы
 * - Event handlers
 * - Загрузка данных
 */
export function useGanttConfig({
  containerRef,
  timeScale,
  colorField,
  readonly,
  columns,
  customColors,
  tasks,
  onTaskUpdate,
}: UseGanttConfigParams) {

  // Получение цвета из CSS переменной
  const getCSSColor = useCallback((varName: string): string => {
    const root = document.documentElement
    const hslValue = getComputedStyle(root).getPropertyValue(`--${varName}`).trim()
    return hslValue ? `hsl(${hslValue})` : 'hsl(215 16% 47%)' // fallback to status-todo
  }, [])

  // Получение цвета задачи по полю
  const getTaskColor = useCallback((task: any): string => {
    if (!task.details) return getCSSColor('status-todo')

    const fieldValue = (task.details as any)[colorField]

    // Handle arrays (components, labels)
    if (Array.isArray(fieldValue)) {
      const value = fieldValue[0]
      if (value) {
        const customColor = customColors.find(c => c.type === value)
        return customColor?.color || getCSSColor('status-todo')
      }
    } else if (fieldValue) {
      // Single value
      const customColor = customColors.find(c => c.type === fieldValue)
      return customColor?.color || getCSSColor('status-todo')
    }

    return getCSSColor('status-todo')
  }, [colorField, customColors, getCSSColor])

  // Конфигурация шкалы времени
  const configureTimeScale = useCallback(() => {
    switch (timeScale) {
      case 'day':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'day', step: 1, format: '%d' }
        ]
        break
      case 'week':
        gantt.config.scales = [
          { unit: 'month', step: 1, format: '%F %Y' },
          { unit: 'week', step: 1, format: 'Week #%W' }
        ]
        break
      case 'month':
        gantt.config.scales = [
          { unit: 'year', step: 1, format: '%Y' },
          { unit: 'month', step: 1, format: '%M' }
        ]
        break
      case 'quarter':
        gantt.config.scales = [
          { unit: 'year', step: 1, format: '%Y' },
          { unit: 'quarter', step: 1, format: 'Q%q' }
        ]
        break
    }
    gantt.config.scale_height = 50
  }, [timeScale])

  // Конфигурация колонок с template функциями
  const configureColumns = useCallback(() => {
    const visibleColumns = columns
      .filter(col => col.visible)
      .map(col => {
        const columnConfig: any = {
          name: col.name,
          label: col.label,
          tree: col.id === 'text',
          width: col.width,
          resize: col.resize,
          align: col.align
        }

        // Добавляем template для кастомных полей
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
              const color = getTaskColor(task)
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
        }

        return columnConfig
      })

    // Добавляем колонку "add" если не readonly
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
  }, [columns, readonly, getTaskColor])

  // Конфигурация templates
  const configureTemplates = useCallback(() => {
    // Применение цветовой схемы через CSS классы
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

    gantt.templates.task_unscheduled_time = (_task) => {
      return ''
    }
  }, [])

  // Базовая инициализация gantt (только один раз)
  useEffect(() => {
    if (!containerRef.current) return

    // Базовые настройки
    gantt.config.date_format = '%Y-%m-%d %H:%i'
    gantt.config.readonly = readonly
    gantt.config.show_progress = true
    gantt.config.show_links = true
    gantt.config.drag_links = !readonly
    gantt.config.drag_progress = !readonly
    gantt.config.drag_resize = !readonly
    gantt.config.drag_move = !readonly
    gantt.config.autosize = 'y'
    gantt.config.fit_tasks = true
    gantt.config.order_branch = true
    gantt.config.order_branch_free = false
    gantt.config.grid_resize = true
    gantt.config.min_column_width = 50

    // Инициализация templates (один раз)
    configureTemplates()

    // Инициализация
    gantt.init(containerRef.current)

    return () => {
      gantt.clearAll()
    }
  }, [containerRef, readonly, configureTemplates])

  // Обновление шкалы времени (без реинициализации)
  useEffect(() => {
    configureTimeScale()
    if (containerRef.current) {
      gantt.render()
    }
  }, [timeScale, configureTimeScale, containerRef])

  // Обновление колонок (без реинициализации)
  useEffect(() => {
    configureColumns()
    if (containerRef.current) {
      gantt.render()
    }
  }, [columns, readonly, configureColumns, containerRef])

  // Event handlers для обновления задач
  useEffect(() => {
    if (!onTaskUpdate) return

    const handleAfterTaskDrag = (id: string, _mode: string, task: any) => {
      if (readonly) return
      onTaskUpdate(id, {
        start_date: task.start_date,
        end_date: task.end_date,
        progress: task.progress,
      })
    }

    const handleAfterTaskUpdate = (id: string, task: any) => {
      if (readonly) return
      onTaskUpdate(id, {
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
  }, [onTaskUpdate, readonly])

  // Загрузка данных в gantt (только при изменении tasks)
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

    // Загружаем данные
    gantt.clearAll()
    gantt.parse({ data: ganttTasks, links: [] })

    if (ganttTasks.length > 0) {
      gantt.render()
    }
  }, [tasks, getTaskColor])

  // Обновление цветов задач при изменении colorField или customColors (без перезагрузки данных)
  useEffect(() => {
    // Проверяем что gantt уже проинициализирован и есть задачи
    if (!containerRef.current || !tasks || tasks.length === 0) return

    // Обновляем цвета существующих задач
    gantt.eachTask((task: any) => {
      const newColor = getTaskColor(task)
      if (task.color !== newColor) {
        task.color = newColor
        gantt.updateTask(task.id)
      }
    })

    gantt.render()
  }, [colorField, customColors, containerRef, tasks, getTaskColor])

  return {
    getCSSColor,
    getTaskColor,
  }
}
