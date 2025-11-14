import { useRef } from 'react'
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'
import './GanttVisualization.css'
import { useGanttData, useGanttConfig } from '@/hooks'
import { useGanttStore } from '@/store'
import { GanttControlsBar } from './GanttControlsBar'

interface GanttVisualizationProps {
  readonly?: boolean
}

/**
 * GanttVisualization - Presentational Component
 * Чистый UI компонент без бизнес-логики:
 * - Использует hooks для данных и конфигурации
 * - Использует store для настроек
 * - Использует GanttControlsBar для UI controls
 * - CSS в отдельном файле
 */
export function GanttVisualization({ readonly = false }: GanttVisualizationProps) {
  const ganttContainer = useRef<HTMLDivElement>(null)
  const store = useGanttStore()
  const { ganttData, tasks, updateTask } = useGanttData()

  // Business logic: configure gantt via hook
  useGanttConfig({
    containerRef: ganttContainer,
    timeScale: store.timeScale,
    colorField: store.colorField,
    readonly,
    columns: store.columns,
    customColors: store.customColors,
    tasks: tasks || [],
    onTaskUpdate: updateTask,
  })

  // Empty state
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
      {/* Controls Bar - reusable component */}
      <GanttControlsBar tasksCount={tasks.length} />

      {/* DHTMLX Gantt Container */}
      <div
        ref={ganttContainer}
        className="border rounded-lg bg-background overflow-hidden gantt-container"
        style={{ minHeight: '70vh', width: '100%' }}
      />
    </div>
  )
}
