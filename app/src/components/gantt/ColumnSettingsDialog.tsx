import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Columns3, Plus, X, GripVertical } from 'lucide-react'
import type { GanttColumn } from './types'

interface ColumnSettingsDialogProps {
  columns: GanttColumn[]
  onColumnsChange: (columns: GanttColumn[]) => void
}

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

export function ColumnSettingsDialog({ columns, onColumnsChange }: ColumnSettingsDialogProps) {
  const [selectedColumnId, setSelectedColumnId] = useState<string>('')

  const addColumn = () => {
    if (!selectedColumnId) return
    const columnDef = AVAILABLE_COLUMNS.find(col => col.id === selectedColumnId)
    if (!columnDef) return
    const newColumn: GanttColumn = { ...columnDef, visible: true }
    onColumnsChange([...columns, newColumn])
    setSelectedColumnId('')
  }

  const removeColumn = (columnId: string) => {
    onColumnsChange(columns.filter(col => col.id !== columnId))
  }

  const toggleVisibility = (columnId: string) => {
    onColumnsChange(
      columns.map(col =>
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const availableToAdd = AVAILABLE_COLUMNS.filter(
    avail => !columns.some(col => col.id === avail.id)
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns3 className="h-4 w-4 mr-1" />
          Columns
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Column Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Add Column */}
          {availableToAdd.length > 0 && (
            <div className="flex gap-2">
              <Select value={selectedColumnId} onValueChange={setSelectedColumnId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a field..." />
                </SelectTrigger>
                <SelectContent>
                  {availableToAdd.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addColumn} disabled={!selectedColumnId} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Active Columns */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {columns.map((column) => (
              <div key={column.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Checkbox
                  checked={column.visible}
                  onCheckedChange={() => toggleVisibility(column.id)}
                />
                <span className="flex-1 text-sm">{column.label}</span>
                <span className="text-xs text-muted-foreground">{column.width}px</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeColumn(column.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
