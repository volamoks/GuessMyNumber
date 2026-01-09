import { useCallback, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { X, ChevronDown } from 'lucide-react'
import { useGanttStore } from '@/store'
import { useJiraSync } from '@/hooks'
import type { GanttFilters as GanttFiltersType } from '@/features/jira-gantt/store/ganttStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

/**
 * Compact Filters Component - Single Line
 * Auto-syncs on filter changes
 */
export function GanttFilters() {
  const store = useGanttStore()
  const { syncTasks, isSyncing } = useJiraSync()
  const syncTimeoutRef = useRef<number | null>(null)

  // Filter options
  const issueTypes = ['Epic', 'Story', 'Task', 'Bug', 'Sub-task']
  const statuses = ['To Do', 'In Progress', 'Done', 'Closed']
  const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest']

  // Debounced auto-sync
  const debouncedSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    syncTimeoutRef.current = setTimeout(() => {
      if (store.selectedProjectKeys.length > 0) {
        syncTasks()
      }
    }, 500)
  }, [store.selectedProjectKeys, syncTasks])

  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  // Toggle filter
  const toggleFilter = (filterType: Exclude<keyof GanttFiltersType, 'dateRange'>, value: string) => {
    const currentValues = (store.filters[filterType] as string[]) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]

    store.setFilters({
      ...store.filters,
      [filterType]: newValues.length > 0 ? newValues : undefined
    })
    debouncedSync()
  }

  // Clear all
  const clearAll = () => {
    store.clearFilters()
    if (store.selectedProjectKeys.length > 0) {
      syncTasks()
    }
  }

  const hasFilters = store.filters.issueTypes?.length || store.filters.statuses?.length || store.filters.priorities?.length

  if (!store.connectionStatus.connected) {
    return null
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Label className="text-sm font-medium">Filters:</Label>

      {/* Issue Types */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Issue Type
            {store.filters.issueTypes?.length ? (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {store.filters.issueTypes.length}
              </span>
            ) : null}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="p-2 space-y-2">
            {issueTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={store.filters.issueTypes?.includes(type) || false}
                  onCheckedChange={() => toggleFilter('issueTypes', type)}
                  disabled={isSyncing}
                />
                <label
                  htmlFor={`type-${type}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Status
            {store.filters.statuses?.length ? (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {store.filters.statuses.length}
              </span>
            ) : null}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="p-2 space-y-2">
            {statuses.map((status) => (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={store.filters.statuses?.includes(status) || false}
                  onCheckedChange={() => toggleFilter('statuses', status)}
                  disabled={isSyncing}
                />
                <label
                  htmlFor={`status-${status}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {status}
                </label>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Priority */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            Priority
            {store.filters.priorities?.length ? (
              <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                {store.filters.priorities.length}
              </span>
            ) : null}
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="p-2 space-y-2">
            {priorities.map((priority) => (
              <div key={priority} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={store.filters.priorities?.includes(priority) || false}
                  onCheckedChange={() => toggleFilter('priorities', priority)}
                  disabled={isSyncing}
                />
                <label
                  htmlFor={`priority-${priority}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {priority}
                </label>
              </div>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Button */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="h-8">
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}

      {/* Sync Indicator */}
      {isSyncing && (
        <span className="text-xs text-muted-foreground">Syncing...</span>
      )}
    </div>
  )
}
