import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RefreshCw, Download } from 'lucide-react'
import { jiraService } from '@/lib/jira-service'
import { useGanttStore } from '@/store'
import { toast } from 'sonner'

export function JiraSync() {
  const store = useGanttStore()
  const [projects, setProjects] = useState<Array<{ key: string; name: string }>>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (store.connectionStatus.connected) {
      loadProjects()
    }
  }, [store.connectionStatus.connected])

  const loadProjects = async () => {
    try {
      const projectsList = await jiraService.getProjects()
      setProjects(projectsList)
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error('Failed to load JIRA projects')
    }
  }

  const handleSync = async () => {
    if (!store.selectedProjectKey) {
      toast.error('Please select a project first')
      return
    }

    setLoading(true)
    store.setSyncing(true)

    try {
      // Fetch issues from JIRA
      const issues = await jiraService.fetchIssues({
        projectKey: store.selectedProjectKey,
        maxResults: 100,
      })

      // Transform to Gantt tasks
      const tasks = jiraService.transformToGanttTasks(issues)

      // Update store
      const selectedProject = projects.find(p => p.key === store.selectedProjectKey)
      store.setData({
        title: selectedProject?.name || 'JIRA Project',
        description: `Project: ${store.selectedProjectKey}`,
        tasks,
        lastSync: new Date(),
      })

      toast.success(`Synced ${tasks.length} tasks from JIRA`)
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Failed to sync with JIRA')
    } finally {
      setLoading(false)
      store.setSyncing(false)
    }
  }

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
            value={store.selectedProjectKey || ''}
            onValueChange={(value) => store.setSelectedProjectKey(value)}
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
          onClick={handleSync}
          disabled={loading || !store.selectedProjectKey}
          className="w-full"
        >
          {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Syncing...' : 'Sync Tasks'}
        </Button>

        {store.data?.lastSync && (
          <p className="text-xs text-muted-foreground text-center">
            Last synced: {new Date(store.data.lastSync).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
