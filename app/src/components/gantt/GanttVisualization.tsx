import { Gantt } from '@svar-ui/react-gantt'
import '@svar-ui/react-gantt/style.css'
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
    if (!details) return undefined

    switch (colorScheme) {
      case 'type':
        const typeColors: Record<string, string> = {
          'Epic': '#9333ea', // purple-600
          'Story': '#3b82f6', // blue-500
          'Task': '#10b981', // green-500
          'Bug': '#ef4444', // red-500
          'Sub-task': '#6366f1', // indigo-500
        }
        return typeColors[details.issueType] || '#6b7280' // gray-500 default

      case 'status':
        const statusColors: Record<string, string> = {
          'To Do': '#6b7280', // gray-500
          'In Progress': '#eab308', // yellow-500
          'Done': '#10b981', // green-500
          'Closed': '#3b82f6', // blue-500
        }
        return statusColors[details.status] || '#6b7280'

      case 'priority':
        const priorityColors: Record<string, string> = {
          'Highest': '#dc2626', // red-600
          'High': '#f97316', // orange-500
          'Medium': '#eab308', // yellow-500
          'Low': '#3b82f6', // blue-500
          'Lowest': '#6b7280', // gray-500
        }
        return priorityColors[details.priority || 'Medium'] || '#6b7280'

      case 'assignee':
        // Generate color from assignee name hash
        if (details.assignee) {
          const hash = details.assignee.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc)
          }, 0)
          const hue = Math.abs(hash) % 360
          return `hsl(${hue}, 65%, 55%)`
        }
        return '#6b7280'

      default:
        return undefined
    }
  }

  // Transform tasks to SVAR Gantt format
  const ganttTasks = data.tasks.map(task => ({
    id: task.id,
    text: task.text,
    start: format(task.start_date, 'yyyy-MM-dd'),
    end: format(task.end_date, 'yyyy-MM-dd'),
    duration: task.duration,
    progress: task.progress * 100, // SVAR expects 0-100
    parent: task.parent || 0,
    type: task.type || 'task',
    color: getTaskColor(task),
  }))

  const handleTaskUpdate = (id: string, task: any) => {
    if (onTaskUpdate) {
      onTaskUpdate(id, {
        start_date: new Date(task.start),
        end_date: new Date(task.end),
        progress: task.progress / 100,
      })
    }
  }

  // Get timeline scales based on timeScale setting
  const getScales = (scale: TimeScale) => {
    switch (scale) {
      case 'day':
        return [
          { unit: 'month', step: 1, format: 'MMMM yyyy' },
          { unit: 'day', step: 1, format: 'd' },
        ]
      case 'week':
        return [
          { unit: 'month', step: 1, format: 'MMMM yyyy' },
          { unit: 'week', step: 1, format: 'w' },
        ]
      case 'month':
        return [
          { unit: 'year', step: 1, format: 'yyyy' },
          { unit: 'month', step: 1, format: 'MMM' },
        ]
      case 'quarter':
        return [
          { unit: 'year', step: 1, format: 'yyyy' },
          { unit: 'quarter', step: 1, format: 'QQQ' },
        ]
      default:
        return [
          { unit: 'month', step: 1, format: 'MMMM yyyy' },
          { unit: 'day', step: 1, format: 'd' },
        ]
    }
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
            Last synced: {format(data.lastSync, 'PPpp')}
          </p>
        )}
      </div>
      <div className="gantt-chart border rounded-lg bg-background" style={{ height: '600px', width: '100%' }}>
        <Gantt
          tasks={ganttTasks}
          links={[]}
          scales={getScales(timeScale)}
          readonly={readonly}
          onUpdateTask={handleTaskUpdate}
        />
      </div>
    </div>
  )
}
