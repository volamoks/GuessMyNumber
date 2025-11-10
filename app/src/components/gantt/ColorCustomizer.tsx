import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Palette, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { useGanttStore } from '@/store'
import type { ColorScheme } from './GanttSettings'

export interface TaskTypeColor {
  type: string
  color: string
  label: string
}

interface ColorCustomizerProps {
  colorScheme: ColorScheme
  onColorSchemeChange: (scheme: ColorScheme) => void
  colors: TaskTypeColor[]
  onColorsChange: (colors: TaskTypeColor[]) => void
}

// Generate color from hash
const generateColorFromString = (str: string, index: number): string => {
  const predefinedColors = [
    '#9333ea', '#3b82f6', '#10b981', '#ef4444', '#f59e0b',
    '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'
  ]

  if (index < predefinedColors.length) {
    return predefinedColors[index]
  }

  const hash = str.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 65%, 50%)`
}

export function ColorCustomizer({ colorScheme, onColorSchemeChange, colors, onColorsChange }: ColorCustomizerProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const store = useGanttStore()

  // Extract unique values from data based on color scheme
  const uniqueValues = useMemo(() => {
    if (!store.data || !store.data.tasks.length) return []

    const values = new Set<string>()

    store.data.tasks.forEach(task => {
      let value: string | undefined

      switch (colorScheme) {
        case 'type':
          value = task.details?.issueType
          break
        case 'status':
          value = task.details?.status
          break
        case 'priority':
          const priority = task.details?.priority
          value = priority !== null ? priority : undefined
          break
        case 'assignee':
          const assignee = task.details?.assignee
          value = assignee !== null ? assignee : undefined
          break
      }

      if (value) values.add(value)
    })

    return Array.from(values).sort()
  }, [store.data, colorScheme])

  // Auto-generate colors when scheme or data changes
  useEffect(() => {
    if (uniqueValues.length === 0) return

    const currentColorMap = new Map(colors.map(c => [c.type, c.color]))

    const newColors: TaskTypeColor[] = uniqueValues.map((value, index) => ({
      type: value,
      label: value,
      color: currentColorMap.get(value) || generateColorFromString(value, index)
    }))

    onColorsChange(newColors)
  }, [uniqueValues, colorScheme])

  const updateColor = (type: string, newColor: string) => {
    onColorsChange(
      colors.map(item =>
        item.type === type ? { ...item, color: newColor } : item
      )
    )
  }

  const resetToDefaults = () => {
    const defaultColors: TaskTypeColor[] = uniqueValues.map((value, index) => ({
      type: value,
      label: value,
      color: generateColorFromString(value, index)
    }))
    onColorsChange(defaultColors)
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Scheme
          </div>
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </CardTitle>
        {!isCollapsed && (
          <CardDescription>
            Choose parameter and customize colors
          </CardDescription>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          {/* Color Scheme Selector */}
          <div className="space-y-2">
            <Label>Color By</Label>
            <Select value={colorScheme} onValueChange={onColorSchemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="type">Issue Type</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="assignee">Assignee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color List */}
          {colors.length > 0 ? (
            <>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {colors.map((item) => (
                  <div key={item.type} className="flex items-center gap-2">
                    <input
                      type="color"
                      value={item.color}
                      onChange={(e) => updateColor(item.type, e.target.value)}
                      className="h-8 w-12 rounded border border-input cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <Label className="text-sm truncate">{item.label}</Label>
                    </div>
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
                onClick={resetToDefaults}
                className="w-full"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Colors
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No data loaded. Import tasks first.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}
