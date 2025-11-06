import { Gantt, ViewMode } from 'gantt-task-react'
import type { Task } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import type { GanttData } from '@/store'
import { format } from 'date-fns'
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
  if (!data?.tasks || data.tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">No tasks to display</p>
          <p className="text-sm text-muted-foreground mt-2">
            Connect to JIRA and sync tasks to see your Gantt chart
          </p>
        </div>
      </div>
    )
  }

  // Get color based on color scheme
  const getTaskColor = (task: any) => {
    const details = task.details
    if (!details) return { backgroundColor: '#6b7280', backgroundSelectedColor: '#4b5563' }

    let color = '#6b7280'

    switch (colorScheme) {
      case 'type':
        const typeColors: Record<string, string> = {
          'Epic': '#9333ea', // purple-600
          'Story': '#3b82f6', // blue-500
          'Task': '#10b981', // green-500
          'Bug': '#ef4444', // red-500
          'Sub-task': '#6366f1', // indigo-500
        }
        color = typeColors[details.issueType] || '#6b7280'
        break

      case 'status':
        const statusColors: Record<string, string> = {
          'To Do': '#6b7280', // gray-500
          'In Progress': '#eab308', // yellow-500
          'Done': '#10b981', // green-500
          'Closed': '#3b82f6', // blue-500
        }
        color = statusColors[details.status] || '#6b7280'
        break

      case 'priority':
        const priorityColors: Record<string, string> = {
          'Highest': '#dc2626', // red-600
          'High': '#f97316', // orange-500
          'Medium': '#eab308', // yellow-500
          'Low': '#3b82f6', // blue-500
          'Lowest': '#6b7280', // gray-500
        }
        color = priorityColors[details.priority || 'Medium'] || '#6b7280'
        break

      case 'assignee':
        // Generate color from assignee name hash
        if (details.assignee) {
          const hash = details.assignee.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc)
          }, 0)
          const hue = Math.abs(hash) % 360
          color = `hsl(${hue}, 65%, 55%)`
        }
        break
    }

    // Return color with darker shade for selected state
    return {
      backgroundColor: color,
      backgroundSelectedColor: adjustColorBrightness(color, -20),
      progressColor: adjustColorBrightness(color, 20),
      progressSelectedColor: color,
    }
  }

  // Helper to adjust color brightness
  const adjustColorBrightness = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16)
    const amt = Math.round(2.55 * percent)
    const R = (num >> 16) + amt
    const G = (num >> 8 & 0x00FF) + amt
    const B = (num & 0x0000FF) + amt
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1)
  }

  // Transform tasks to gantt-task-react format
  const ganttTasks: Task[] = data.tasks
    .filter(task => {
      // Filter out tasks with invalid dates
      return task.start_date && task.end_date &&
             task.start_date instanceof Date &&
             task.end_date instanceof Date &&
             !isNaN(task.start_date.getTime()) &&
             !isNaN(task.end_date.getTime())
    })
    .map(task => {
      const colors = getTaskColor(task)
      return {
        start: task.start_date,
        end: task.end_date,
        name: task.text,
        id: task.id,
        type: task.parent ? 'task' : (task.type === 'project' ? 'project' : 'task'),
        progress: Math.min(100, Math.max(0, task.progress * 100)), // Ensure 0-100
        isDisabled: readonly,
        project: task.parent || undefined,
        dependencies: [],
        styles: colors,
      }
    })

  const handleTaskChange = (task: Task) => {
    if (onTaskUpdate && !readonly) {
      onTaskUpdate(task.id, {
        start_date: task.start,
        end_date: task.end,
        progress: task.progress / 100,
      })
    }
  }

  // Get ViewMode based on timeScale setting
  const getViewMode = (scale: TimeScale): ViewMode => {
    switch (scale) {
      case 'day':
        return ViewMode.Day
      case 'week':
        return ViewMode.Week
      case 'month':
        return ViewMode.Month
      case 'quarter':
        return ViewMode.QuarterYear
      default:
        return ViewMode.Day
    }
  }

  // Check if we have any valid tasks to display
  if (ganttTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">No valid tasks to display</p>
          <p className="text-sm text-muted-foreground mt-2">
            Tasks must have valid start and end dates
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="gantt-container">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{data.title}</h3>
        {data.description && (
          <p className="text-sm text-muted-foreground">{data.description}</p>
        )}
        {data.lastSync && (
          <p className="text-xs text-muted-foreground mt-1">
            Last synced: {format(data.lastSync, 'PPpp')} • {ganttTasks.length} tasks
          </p>
        )}
      </div>
      <div className="gantt-chart border rounded-lg bg-background overflow-hidden" style={{ height: '600px' }}>
        <Gantt
          tasks={ganttTasks}
          viewMode={getViewMode(timeScale)}
          onDateChange={handleTaskChange}
          onProgressChange={handleTaskChange}
          onDoubleClick={(task) => console.log('Double click:', task)}
          listCellWidth="200px"
          columnWidth={timeScale === 'day' ? 60 : timeScale === 'week' ? 100 : 120}
        />
      </div>
    </div>
  )
}
