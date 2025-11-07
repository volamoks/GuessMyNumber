import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Columns3, X, GripVertical, ChevronDown, ChevronUp, Plus } from 'lucide-react'

export interface GanttColumn {
  id: string
  name: string
  label: string
  width: number
  visible: boolean
  resize: boolean
  align?: 'left' | 'center' | 'right'
}

interface GanttColumnManagerProps {
  columns: GanttColumn[]
  onColumnsChange: (columns: GanttColumn[]) => void
}

// Все доступные колонки из JIRA (21 fields)
const AVAILABLE_COLUMNS: Omit<GanttColumn, 'visible'>[] = [
  { id: 'text', name: 'text', label: 'Task Name', width: 250, resize: true, align: 'left' },
  { id: 'key', name: 'key', label: 'Key', width: 100, resize: true, align: 'left' },
  { id: 'start_date', name: 'start_date', label: 'Start Date', width: 100, resize: true, align: 'center' },
  { id: 'end_date', name: 'end_date', label: 'Due Date', width: 100, resize: true, align: 'center' },
  { id: 'duration', name: 'duration', label: 'Duration (days)', width: 80, resize: true, align: 'center' },
  { id: 'progress', name: 'progress', label: 'Progress %', width: 80, resize: true, align: 'center' },
  { id: 'assignee', name: 'assignee', label: 'Assignee', width: 120, resize: true, align: 'left' },
  { id: 'reporter', name: 'reporter', label: 'Reporter', width: 120, resize: true, align: 'left' },
  { id: 'priority', name: 'priority', label: 'Priority', width: 90, resize: true, align: 'center' },
  { id: 'status', name: 'status', label: 'Status', width: 110, resize: true, align: 'center' },
  { id: 'issueType', name: 'issueType', label: 'Issue Type', width: 100, resize: true, align: 'center' },
  { id: 'labels', name: 'labels', label: 'Labels', width: 150, resize: true, align: 'left' },
  { id: 'components', name: 'components', label: 'Components', width: 150, resize: true, align: 'left' },
  { id: 'description', name: 'description', label: 'Description', width: 200, resize: true, align: 'left' },
  { id: 'epic', name: 'epic', label: 'Epic', width: 120, resize: true, align: 'left' },
  { id: 'sprint', name: 'sprint', label: 'Sprint', width: 120, resize: true, align: 'left' },
  { id: 'resolution', name: 'resolution', label: 'Resolution', width: 100, resize: true, align: 'center' },
  { id: 'estimatedHours', name: 'estimatedHours', label: 'Estimate (h)', width: 90, resize: true, align: 'center' },
  { id: 'remainingHours', name: 'remainingHours', label: 'Remaining (h)', width: 100, resize: true, align: 'center' },
  { id: 'createdDate', name: 'createdDate', label: 'Created', width: 100, resize: true, align: 'center' },
  { id: 'updatedDate', name: 'updatedDate', label: 'Updated', width: 100, resize: true, align: 'center' },
]

export function GanttColumnManager({ columns, onColumnsChange }: GanttColumnManagerProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [selectedColumnId, setSelectedColumnId] = useState<string>('')

  const addColumn = () => {
    if (!selectedColumnId) return

    const columnDef = AVAILABLE_COLUMNS.find(col => col.id === selectedColumnId)
    if (!columnDef) return

    const newColumn: GanttColumn = { ...columnDef, visible: true }
    onColumnsChange([...columns, newColumn])
    setSelectedColumnId('') // Reset selection
  }

  const removeColumn = (columnId: string) => {
    onColumnsChange(columns.filter(col => col.id !== columnId))
  }

  const toggleColumnVisibility = (columnId: string) => {
    onColumnsChange(
      columns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const availableToAdd = AVAILABLE_COLUMNS.filter(
    avail => !columns.some(col => col.id === avail.id)
  )

  const visibleCount = columns.filter(col => col.visible).length

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Columns3 className="h-5 w-5" />
            Column Settings
            <span className="text-xs text-muted-foreground">
              ({visibleCount} visible)
            </span>
          </div>
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </CardTitle>
        {!isCollapsed && (
          <CardDescription>
            Customize which JIRA fields to show as columns
          </CardDescription>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Add Column Dropdown */}
          {availableToAdd.length > 0 && (
            <div className="space-y-2">
              <Label className="font-semibold">Add Column</Label>
              <div className="flex gap-2">
                <Select value={selectedColumnId} onValueChange={setSelectedColumnId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a JIRA field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableToAdd.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={addColumn}
                  disabled={!selectedColumnId}
                  size="sm"
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Current Columns */}
          <div className="space-y-2">
            <Label className="font-semibold">Active Columns</Label>
            <div className="space-y-2 border rounded-lg p-3 max-h-64 overflow-y-auto">
              {columns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No columns configured. Add columns above.
                </p>
              ) : (
                columns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    <Checkbox
                      id={`col-${column.id}`}
                      checked={column.visible}
                      onCheckedChange={() => toggleColumnVisibility(column.id)}
                    />
                    <label
                      htmlFor={`col-${column.id}`}
                      className="flex-1 text-sm font-medium cursor-pointer"
                    >
                      {column.label}
                    </label>
                    <span className="text-xs text-muted-foreground min-w-[45px] text-right">
                      {column.width}px
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeColumn(column.id)}
                      title="Remove column"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="font-semibold mb-1">💡 Available JIRA Fields (21 total):</div>
            <div className="grid grid-cols-2 gap-1">
              <span>• Task Name</span>
              <span>• Key</span>
              <span>• Start Date</span>
              <span>• Due Date</span>
              <span>• Duration</span>
              <span>• Progress</span>
              <span>• Assignee</span>
              <span>• Reporter</span>
              <span>• Priority</span>
              <span>• Status</span>
              <span>• Issue Type</span>
              <span>• Labels</span>
              <span>• Components</span>
              <span>• Description</span>
              <span>• Epic</span>
              <span>• Sprint</span>
              <span>• Resolution</span>
              <span>• Estimate (h)</span>
              <span>• Remaining (h)</span>
              <span>• Created</span>
              <span>• Updated</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
