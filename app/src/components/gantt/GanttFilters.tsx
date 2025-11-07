import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useGanttStore } from '@/store'
import { useJiraProjects, useJiraSync } from '@/hooks'
import type { GanttFilters as GanttFiltersType } from '@/store/ganttStore'

/**
 * Advanced Filters Component with Auto-sync
 * Поддержка множественного выбора проектов для портфельного анализа
 */
export function GanttFilters() {
  const store = useGanttStore()
  const { projects, isLoading: isLoadingProjects } = useJiraProjects()
  const { syncTasks, isSyncing } = useJiraSync()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const [localFilters, setLocalFilters] = useState<GanttFiltersType>(store.filters)
  const [selectedProjects, setSelectedProjects] = useState<string[]>(store.selectedProjectKeys)

  // Issue types options
  const issueTypes = ['Epic', 'Story', 'Task', 'Bug', 'Sub-task']

  // Status options
  const statuses = ['To Do', 'In Progress', 'Done', 'Closed']

  // Priority options
  const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest']

  // Auto-collapse после первой синхронизации
  useEffect(() => {
    if (store.data && store.data.tasks.length > 0) {
      setIsCollapsed(true)
    }
  }, [store.data])

  // Toggle project selection
  const toggleProject = (projectKey: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectKey)) {
        return prev.filter(k => k !== projectKey)
      } else {
        return [...prev, projectKey]
      }
    })
  }

  // Toggle filter option
  const toggleFilterOption = (filterType: keyof GanttFiltersType, value: string) => {
    setLocalFilters(prev => {
      const currentValues = (prev[filterType] as string[]) || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]

      return {
        ...prev,
        [filterType]: newValues.length > 0 ? newValues : undefined
      }
    })
  }

  // Apply filters and auto-sync
  const handleApplyFilters = async () => {
    // Update store
    store.setSelectedProjectKeys(selectedProjects)
    store.setFilters(localFilters)

    // Auto-sync with new filters
    if (selectedProjects.length > 0) {
      await syncTasks(selectedProjects.length === 1 ? selectedProjects[0] : undefined)
    }
  }

  // Clear all filters
  const handleClearFilters = () => {
    setLocalFilters({})
    setSelectedProjects([])
    store.clearFilters()
    store.setSelectedProjectKeys([])
  }

  const hasFilters = localFilters.issueTypes?.length || localFilters.statuses?.length ||
                     localFilters.priorities?.length || selectedProjects.length > 0

  if (!store.connectionStatus.connected) {
    return null
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
            {hasFilters && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {(localFilters.issueTypes?.length || 0) + (localFilters.statuses?.length || 0) +
                 (localFilters.priorities?.length || 0) + selectedProjects.length} active
              </span>
            )}
          </div>
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </CardTitle>
        {!isCollapsed && (
          <CardDescription>
            Filter tasks by project, type, status, priority. Auto-syncs on apply.
          </CardDescription>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-6">
          {/* Multi-Project Selection */}
          <div className="space-y-3">
            <Label className="font-semibold">Projects (Portfolio Analysis)</Label>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
              {isLoadingProjects ? (
                <p className="text-sm text-muted-foreground">Loading projects...</p>
              ) : projects.length === 0 ? (
                <p className="text-sm text-muted-foreground">No projects available</p>
              ) : (
                projects.map((project) => (
                  <div key={project.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`project-${project.key}`}
                      checked={selectedProjects.includes(project.key)}
                      onCheckedChange={() => toggleProject(project.key)}
                    />
                    <label
                      htmlFor={`project-${project.key}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {project.name} ({project.key})
                    </label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Select multiple projects to analyze portfolio across teams
            </p>
          </div>

          {/* Issue Type Filter */}
          <div className="space-y-3">
            <Label className="font-semibold">Issue Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {issueTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={localFilters.issueTypes?.includes(type) || false}
                    onCheckedChange={() => toggleFilterOption('issueTypes', type)}
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="font-semibold">Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={localFilters.statuses?.includes(status) || false}
                    onCheckedChange={() => toggleFilterOption('statuses', status)}
                  />
                  <label
                    htmlFor={`status-${status}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {status}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div className="space-y-3">
            <Label className="font-semibold">Priority</Label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={localFilters.priorities?.includes(priority) || false}
                    onCheckedChange={() => toggleFilterOption('priorities', priority)}
                  />
                  <label
                    htmlFor={`priority-${priority}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {priority}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={handleApplyFilters}
              disabled={isSyncing || selectedProjects.length === 0}
              className="flex-1"
            >
              {isSyncing ? 'Syncing...' : 'Apply & Sync'}
            </Button>
            {hasFilters && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="icon"
                title="Clear all filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
