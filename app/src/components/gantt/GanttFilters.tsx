import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useGanttStore } from '@/store'
import { useJiraSync } from '@/hooks'
import type { GanttFilters as GanttFiltersType } from '@/store/ganttStore'

/**
 * Advanced Filters Component with Auto-sync
 * Фильтрация задач по типу, статусу, приоритету
 */
export function GanttFilters() {
  const store = useGanttStore()
  const { syncTasks, isSyncing } = useJiraSync()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Debounced auto-sync function
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = setTimeout(() => {
      if (store.selectedProjectKeys.length > 0) {
        syncTasks()
      }
    }, 500) // 500ms debounce
  }, [store.selectedProjectKeys, syncTasks])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  // Toggle filter option with auto-sync
  const toggleFilterOption = (filterType: keyof GanttFiltersType, value: string) => {
    const currentValues = (store.filters[filterType] as string[]) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]

    const newFilters = {
      ...store.filters,
      [filterType]: newValues.length > 0 ? newValues : undefined
    }

    // Update store immediately
    store.setFilters(newFilters)

    // Trigger debounced sync
    debouncedSync()
  }

  // Clear all filters with immediate sync
  const handleClearFilters = () => {
    store.clearFilters()

    // Immediate sync when clearing (no debounce)
    if (store.selectedProjectKeys.length > 0) {
      syncTasks()
    }
  }

  const hasFilters = store.filters.issueTypes?.length || store.filters.statuses?.length ||
                     store.filters.priorities?.length

  if (!store.connectionStatus.connected) {
    return null
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Task Filters
            {hasFilters && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                {(localFilters.issueTypes?.length || 0) + (localFilters.statuses?.length || 0) +
                 (localFilters.priorities?.length || 0)} active
              </span>
            )}
          </div>
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </CardTitle>
        {!isCollapsed && (
          <CardDescription>
            Filter tasks by type, status, priority. Auto-syncs on change.
          </CardDescription>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Issue Type Filter */}
          <div className="space-y-2">
            <Label className="font-semibold">Issue Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {issueTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${type}`}
                    checked={store.filters.issueTypes?.includes(type) || false}
                    onCheckedChange={() => toggleFilterOption('issueTypes', type)}
                    disabled={isSyncing}
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
          <div className="space-y-2">
            <Label className="font-semibold">Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {statuses.map((status) => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={store.filters.statuses?.includes(status) || false}
                    onCheckedChange={() => toggleFilterOption('statuses', status)}
                    disabled={isSyncing}
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
          <div className="space-y-2">
            <Label className="font-semibold">Priority</Label>
            <div className="grid grid-cols-2 gap-2">
              {priorities.map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={store.filters.priorities?.includes(priority) || false}
                    onCheckedChange={() => toggleFilterOption('priorities', priority)}
                    disabled={isSyncing}
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

          {/* Clear Filters Button */}
          {hasFilters && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="sm"
                className="w-full"
                disabled={isSyncing}
                title="Clear all filters"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Auto-sync indicator */}
          {isSyncing && (
            <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 p-2 rounded">
              🔄 Auto-syncing with filters...
            </p>
          )}

          {store.selectedProjectKeys.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-2 rounded">
              ⚠️ Select at least one project in "Project Sync" to apply filters
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
