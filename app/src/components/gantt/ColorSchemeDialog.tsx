import { useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Palette, RotateCcw } from 'lucide-react'
import { useGanttStore } from '@/store'
import type { TaskTypeColor } from './ColorCustomizer'

interface ColorSchemeDialogProps {
  colorField: string
  onColorFieldChange: (field: string) => void
  colors: TaskTypeColor[]
  onColorsChange: (colors: TaskTypeColor[]) => void
}

// All available JIRA fields for coloring
const JIRA_FIELDS = [
  { id: 'issueType', label: 'Issue Type' },
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Priority' },
  { id: 'assignee', label: 'Assignee' },
  { id: 'reporter', label: 'Reporter' },
  { id: 'epic', label: 'Epic' },
  { id: 'sprint', label: 'Sprint' },
  { id: 'resolution', label: 'Resolution' },
  { id: 'components', label: 'Components' },
  { id: 'labels', label: 'Labels' },
]

// Generate color from hash
const generateColor = (str: string, index: number): string => {
  const predefinedColors = [
    '#9333ea', '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
    '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'
  ]

  if (index < predefinedColors.length) {
    return predefinedColors[index]
  }

  const hash = str.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 65%, 50%)`
}

export function ColorSchemeDialog({ colorField, onColorFieldChange, colors, onColorsChange }: ColorSchemeDialogProps) {
  const store = useGanttStore()

  // Extract unique values from data based on selected field
  const uniqueValues = useMemo(() => {
    if (!store.data || !store.data.tasks.length) return []

    const values = new Set<string>()

    store.data.tasks.forEach(task => {
      const details = task.details
      if (!details) return

      let value: any = (details as any)[colorField]

      // Handle arrays (components, labels)
      if (Array.isArray(value)) {
        value.forEach((v: string) => values.add(v))
      } else if (value) {
        values.add(String(value))
      }
    })

    return Array.from(values).sort()
  }, [store.data, colorField])

  // Auto-generate colors when field or data changes
  useEffect(() => {
    if (uniqueValues.length === 0) return

    const currentColorMap = new Map(colors.map(c => [c.type, c.color]))

    const newColors: TaskTypeColor[] = uniqueValues.map((value, index) => ({
      type: value,
      label: value,
      color: currentColorMap.get(value) || generateColor(value, index)
    }))

    onColorsChange(newColors)
  }, [uniqueValues, colorField])

  const updateColor = (type: string, newColor: string) => {
    onColorsChange(
      colors.map(item =>
        item.type === type ? { ...item, color: newColor } : item
      )
    )
  }

  const resetColors = () => {
    const defaultColors: TaskTypeColor[] = uniqueValues.map((value, index) => ({
      type: value,
      label: value,
      color: generateColor(value, index)
    }))
    onColorsChange(defaultColors)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-1" />
          Colors
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Color Scheme</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Field Selector */}
          <div className="space-y-2">
            <Label>Color By Field</Label>
            <Select value={colorField} onValueChange={onColorFieldChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JIRA_FIELDS.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color List */}
          {colors.length > 0 ? (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {colors.map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.color}
                      onChange={(e) => updateColor(item.type, e.target.value)}
                      className="h-8 w-12 rounded border cursor-pointer"
                    />
                    <Label className="flex-1 text-sm truncate">{item.label}</Label>
                    <div
                      className="h-8 w-16 rounded border flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={resetColors}
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Defaults
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data loaded. Import tasks first.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
