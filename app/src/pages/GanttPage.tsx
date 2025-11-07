import { useState } from 'react'
import { useGanttStore } from '@/store'
import { GanttVisualization } from '@/components/gantt/GanttVisualization'
import { JiraConnection } from '@/components/gantt/JiraConnection'
import { JiraSync } from '@/components/gantt/JiraSync'
import { GanttFilters } from '@/components/gantt/GanttFilters'
import { GanttSettings, type GanttSettingsConfig } from '@/components/gantt/GanttSettings'
import { Button } from '@/components/ui/button'
import { Download, FileJson } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Gantt Page (Presentational Component)
 * Бизнес-логика вынесена в hooks, компонент только отображает UI
 */
export function GanttPage() {
  const store = useGanttStore()
  const [settings, setSettings] = useState<GanttSettingsConfig>({
    colorScheme: 'type',
    timeScale: 'day',
  })

  const handleExportJSON = () => {
    if (!store.data) {
      toast.error('No data to export')
      return
    }

    const dataStr = JSON.stringify(store.data, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `gantt-${store.selectedProjectKey}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast.success('Gantt data exported')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">JIRA Gantt Chart</h1>
        <p className="text-muted-foreground">
          Visualize your JIRA projects as interactive Gantt charts
        </p>
      </div>

      {/* Connection & Sync Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <JiraConnection />
        <JiraSync />
        <GanttFilters />
        <GanttSettings settings={settings} onSettingsChange={setSettings} />
      </div>

      {/* Gantt Visualization */}
      {store.data ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{store.data.title}</h2>
              <p className="text-sm text-muted-foreground">
                {store.data.tasks.length} tasks
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportJSON}>
                <FileJson className="mr-2 h-4 w-4" />
                Export JSON
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>

          <GanttVisualization
            readonly={false}
            colorScheme={settings.colorScheme}
            timeScale={settings.timeScale}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">No Gantt Chart Yet</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Connect to JIRA and sync a project to visualize your tasks as a Gantt chart.
              You can drag and drop tasks to reschedule them, and changes will sync back to JIRA.
            </p>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-lg bg-muted p-4 text-sm">
        <h4 className="font-medium mb-2">💡 Features</h4>
        <ul className="space-y-1 text-muted-foreground">
          <li>• Import tasks from any JIRA project</li>
          <li>• Drag and drop to reschedule tasks</li>
          <li>• Two-way sync with JIRA (changes sync back automatically)</li>
          <li>• View task dependencies and progress</li>
          <li>• Export to JSON or PDF</li>
        </ul>
      </div>
    </div>
  )
}
