import { type RefObject } from 'react'
import type { TimeScale, GanttColumn, TaskTypeColor } from '@/features/jira-gantt/components/types'
import { useGanttColors } from './gantt/useGanttColors'
import { useGanttTemplates } from './gantt/useGanttTemplates'
import { useGanttColumns } from './gantt/useGanttColumns'
import { useGanttTimeScale } from './gantt/useGanttTimeScale'
import { useGanttInit } from './gantt/useGanttInit'
import { useGanttData } from './gantt/useGanttData'
import { useGanttEvents } from './gantt/useGanttEvents'

interface UseGanttConfigParams {
  containerRef: RefObject<HTMLDivElement | null>
  timeScale: TimeScale
  colorField: string
  readonly: boolean
  columns: GanttColumn[]
  customColors: TaskTypeColor[]
  tasks: any[]
  modifiedTasks?: Set<string>
  onTaskUpdate?: (id: string, updates: any) => void
}

/**
 * useGanttConfig - Hook для конфигурации DHTMLX Gantt
 * Инкапсулирует всю бизнес-логику конфигурации gantt с использованием составных хуков.
 */
export function useGanttConfig({
  containerRef,
  timeScale,
  colorField,
  readonly,
  columns,
  customColors,
  tasks,
  modifiedTasks,
  onTaskUpdate,
}: UseGanttConfigParams) {

  // 1. Colors logic
  const { getCSSColor, getTaskColor } = useGanttColors(colorField, customColors)

  // 2. Templates configuration
  const configureTemplates = useGanttTemplates(modifiedTasks, getTaskColor)

  // 3. Initialization
  useGanttInit(containerRef, readonly, configureTemplates)

  // 4. Time Scale
  useGanttTimeScale(timeScale, containerRef)

  // 5. Columns
  useGanttColumns(columns, readonly, getTaskColor, containerRef)

  // 6. Data & Colors update
  useGanttData(tasks, getTaskColor, colorField, customColors, containerRef)

  // 7. Events
  useGanttEvents(onTaskUpdate, readonly)

  return {
    getCSSColor,
    getTaskColor,
  }
}
