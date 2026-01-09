import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Download, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useJiraProjects } from '@/hooks'
import { useGanttStore } from '@/store'

/**
 * Компонент синхронизации с JIRA (Presentational Component)
 * Поддержка множественного выбора проектов для портфельного анализа
 */
export function JiraSync() {
  const store = useGanttStore()
  const {
    projects,
    isLoading: isLoadingProjects,
    autoLoadProjects,
  } = useJiraProjects()

  const [isCollapsed, setIsCollapsed] = useState(false)
  const selectedProjects = store.selectedProjectKeys

  // Auto-load projects при подключении
  useEffect(() => {
    autoLoadProjects()
  }, [autoLoadProjects])

  const toggleProject = (projectKey: string) => {
    if (selectedProjects.includes(projectKey)) {
      store.removeProjectKey(projectKey)
    } else {
      store.addProjectKey(projectKey)
    }
  }

  const clearSelection = () => {
    store.setSelectedProjectKeys([])
  }

  if (!store.connectionStatus.connected) {
    return null
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Project Sync
            {selectedProjects.length > 0 && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {selectedProjects.length} selected
              </span>
            )}
          </div>
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </CardTitle>
        {!isCollapsed && (
          <CardDescription>
            Select one or more projects for portfolio analysis
          </CardDescription>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Multi-Project Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-semibold">Select Projects</Label>
              {selectedProjects.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
              {isLoadingProjects ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Loading projects...
                </p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects available
                </p>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.key}
                    className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md transition-colors"
                  >
                    <Checkbox
                      id={`project-sync-${project.key}`}
                      checked={selectedProjects.includes(project.key)}
                      onCheckedChange={() => toggleProject(project.key)}
                    />
                    <label
                      htmlFor={`project-sync-${project.key}`}
                      className="flex-1 text-sm font-medium leading-none cursor-pointer"
                    >
                      {project.name}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({project.key})
                      </span>
                    </label>
                  </div>
                ))
              )}
            </div>

            {selectedProjects.length > 1 && (
              <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                💼 Portfolio Mode: Analyzing {selectedProjects.length} projects together
              </p>
            )}

            {selectedProjects.length > 0 && (
              <p className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 p-2 rounded">
                ✓ {selectedProjects.length} project{selectedProjects.length > 1 ? 's' : ''} selected. Use "Import Tasks" button below the chart to sync.
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
