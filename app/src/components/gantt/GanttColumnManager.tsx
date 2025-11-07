import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Columns3, Plus, X, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'

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

const AVAILABLE_COLUMNS: Omit<GanttColumn, 'visible'>[] = [
  { id: 'text', name: 'text', label: 'Task', width: 250, resize: true, align: 'left' },
  { id: 'start_date', name: 'start_date', label: 'Start Date', width: 90, resize: true, align: 'center' },
  { id: 'end_date', name: 'end_date', label: 'End Date', width: 90, resize: true, align: 'center' },
  { id: 'duration', name: 'duration', label: 'Duration', width: 70, resize: true, align: 'center' },
  { id: 'progress', name: 'progress', label: 'Progress', width: 80, resize: true, align: 'center' },
  { id: 'assignee', name: 'assignee', label: 'Assignee', width: 120, resize: true, align: 'left' },
  { id: 'priority', name: 'priority', label: 'Priority', width: 90, resize: true, align: 'center' },
  { id: 'status', name: 'status', label: 'Status', width: 100, resize: true, align: 'center' },
  { id: 'issueType', name: 'issueType', label: 'Type', width: 90, resize: true, align: 'center' },
]

export function GanttColumnManager({ columns, onColumnsChange }: GanttColumnManagerProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  const addColumn = (columnDef: Omit<GanttColumn, 'visible'>) => {
    const newColumn: GanttColumn = { ...columnDef, visible: true }
    onColumnsChange([...columns, newColumn])
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
            Customize which columns to show in the Gantt chart
          </CardDescription>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Current Columns */}
          <div className="space-y-2">
            <Label className="font-semibold">Active Columns</Label>
            <div className="space-y-2 border rounded-lg p-3 max-h-48 overflow-y-auto">
              {columns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No columns configured. Add columns below.
                </p>
              ) : (
                columns.map((column) => (
                  <div
                    key={column.id}
                    className="flex items-center gap-2 p-2 bg-muted rounded-lg"
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
                    <span className="text-xs text-muted-foreground">
                      {column.width}px
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => removeColumn(column.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Available Columns to Add */}
          {availableToAdd.length > 0 && (
            <div className="space-y-2">
              <Label className="font-semibold">Add Columns</Label>
              <div className="flex flex-wrap gap-2">
                {availableToAdd.map((columnDef) => (
                  <Button
                    key={columnDef.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addColumn(columnDef)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    {columnDef.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            💡 <strong>Tip:</strong> Use checkboxes to show/hide columns. Click X to remove them completely.
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// Import missing components
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
