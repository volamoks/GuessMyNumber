import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RefreshCw, Download } from 'lucide-react'
import { useJiraProjects, useJiraSync } from '@/hooks'
import { useGanttStore } from '@/store'

/**
 * Компонент синхронизации с JIRA (Presentational Component)
 * Вся логика вынесена в useJiraProjects и useJiraSync hooks
 */
export function JiraSync() {
  const store = useGanttStore()
  const {
    projects,
    isLoading: isLoadingProjects,
    selectedProjectKey,
    autoLoadProjects,
    selectProject,
  } = useJiraProjects()

  const {
    isSyncing,
    lastSync,
    tasksCount,
    syncTasks,
  } = useJiraSync()

  // Auto-load projects при подключении
  useEffect(() => {
    autoLoadProjects()
  }, [autoLoadProjects])

  if (!store.connectionStatus.connected) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Sync from JIRA
        </CardTitle>
        <CardDescription>
          Select a project and import tasks to visualize in Gantt chart
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Project</Label>
          <Select
            value={selectedProjectKey || ''}
            onValueChange={selectProject}
            disabled={isLoadingProjects}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.key} value={project.key}>
                  {project.name} ({project.key})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => syncTasks()}
          disabled={isSyncing || !selectedProjectKey}
          className="w-full"
        >
          {isSyncing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {isSyncing ? 'Syncing...' : 'Sync Tasks'}
        </Button>

        {lastSync && (
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Last synced: {new Date(lastSync).toLocaleString()}</p>
            {tasksCount > 0 && <p>{tasksCount} tasks loaded</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
