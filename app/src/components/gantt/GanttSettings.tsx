import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock } from 'lucide-react'

export type ColorScheme = 'type' | 'status' | 'priority' | 'assignee'
export type TimeScale = 'day' | 'week' | 'month' | 'quarter'

export interface GanttSettingsConfig {
  colorScheme: ColorScheme
  timeScale: TimeScale
}

interface GanttSettingsProps {
  settings: GanttSettingsConfig
  onSettingsChange: (settings: GanttSettingsConfig) => void
}

export function GanttSettings({ settings, onSettingsChange }: GanttSettingsProps) {
  const handleTimeScaleChange = (timeScale: TimeScale) => {
    onSettingsChange({ ...settings, timeScale })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <CardTitle>Timeline Scale</CardTitle>
        </div>
        <CardDescription>
          Adjust timeline zoom level
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Scale */}
        <div className="space-y-2">
          <Label>Zoom Level</Label>
          <Select value={settings.timeScale} onValueChange={handleTimeScaleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">
                <div className="flex flex-col">
                  <span className="font-medium">Day</span>
                  <span className="text-xs text-muted-foreground">Month → Day</span>
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex flex-col">
                  <span className="font-medium">Week</span>
                  <span className="text-xs text-muted-foreground">Month → Week</span>
                </div>
              </SelectItem>
              <SelectItem value="month">
                <div className="flex flex-col">
                  <span className="font-medium">Month</span>
                  <span className="text-xs text-muted-foreground">Year → Month</span>
                </div>
              </SelectItem>
              <SelectItem value="quarter">
                <div className="flex flex-col">
                  <span className="font-medium">Quarter</span>
                  <span className="text-xs text-muted-foreground">Year → Quarter</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
