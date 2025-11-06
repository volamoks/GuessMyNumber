import { Gantt } from '@svar-ui/react-gantt'
import '@svar-ui/react-gantt/style.css'
import type { GanttData } from '@/store'
import { format } from 'date-fns'

interface GanttVisualizationProps {
  data: GanttData
  onTaskUpdate?: (taskId: string, updates: any) => void
  readonly?: boolean
}

export function GanttVisualization({ data, onTaskUpdate, readonly = false }: GanttVisualizationProps) {
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
      <div className="gantt-chart border rounded-lg" style={{ height: '600px', width: '100%' }}>
        <Gantt
          tasks={ganttTasks}
          links={[]}
          scales={[
            { unit: 'month', step: 1, format: 'MMMM yyyy' },
            { unit: 'day', step: 1, format: 'd' },
          ]}
          readonly={readonly}
          onUpdateTask={handleTaskUpdate}
        />
      </div>
    </div>
  )
}
