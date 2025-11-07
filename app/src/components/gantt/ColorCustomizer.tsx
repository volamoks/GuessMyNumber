import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Palette, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'

export interface TaskTypeColor {
  type: string
  color: string
  label: string
}

interface ColorCustomizerProps {
  colors: TaskTypeColor[]
  onColorsChange: (colors: TaskTypeColor[]) => void
}

const DEFAULT_COLORS: TaskTypeColor[] = [
  { type: 'Epic', color: '#9333ea', label: 'Epic' },
  { type: 'Story', color: '#3b82f6', label: 'Story' },
  { type: 'Task', color: '#10b981', label: 'Task' },
  { type: 'Bug', color: '#ef4444', label: 'Bug' },
  { type: 'Sub-task', color: '#6366f1', label: 'Sub-task' },
]

export function ColorCustomizer({ colors, onColorsChange }: ColorCustomizerProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)

  const updateColor = (type: string, newColor: string) => {
    onColorsChange(
      colors.map(item =>
        item.type === type ? { ...item, color: newColor } : item
      )
    )
  }

  const resetToDefaults = () => {
    onColorsChange(DEFAULT_COLORS)
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Customization
          </div>
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </CardTitle>
        {!isCollapsed && (
          <CardDescription>
            Customize colors for each task type
          </CardDescription>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {colors.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <input
                  type="color"
                  value={item.color}
                  onChange={(e) => updateColor(item.type, e.target.value)}
                  className="h-10 w-16 rounded border border-input cursor-pointer"
                />
                <div className="flex-1">
                  <Label className="font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.color.toUpperCase()}</p>
                </div>
                <div
                  className="h-10 w-20 rounded border"
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
            Reset to Defaults
          </Button>

          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            💡 <strong>Tip:</strong> Click the color box to choose custom colors for each task type
          </div>
        </CardContent>
      )}
    </Card>
  )
}
