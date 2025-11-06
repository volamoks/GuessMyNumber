import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings2, Palette, Clock } from 'lucide-react'

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
  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    onSettingsChange({ ...settings, colorScheme })
  }

  const handleTimeScaleChange = (timeScale: TimeScale) => {
    onSettingsChange({ ...settings, timeScale })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          <CardTitle>Настройки Gantt</CardTitle>
        </div>
        <CardDescription>
          Настройте отображение и цветовую схему
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Color Scheme */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Цветовая схема
          </Label>
          <Select value={settings.colorScheme} onValueChange={handleColorSchemeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="type">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  По типу задачи (Epic, Story, Task, Bug)
                </div>
              </SelectItem>
              <SelectItem value="status">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  По статусу (To Do, In Progress, Done)
                </div>
              </SelectItem>
              <SelectItem value="priority">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                  </div>
                  По приоритету (Highest, High, Medium, Low)
                </div>
              </SelectItem>
              <SelectItem value="assignee">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                  </div>
                  По исполнителю
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Scale */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Масштаб таймлайна
          </Label>
          <Select value={settings.timeScale} onValueChange={handleTimeScaleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">
                <div className="flex flex-col">
                  <span className="font-medium">День</span>
                  <span className="text-xs text-muted-foreground">Месяц → День</span>
                </div>
              </SelectItem>
              <SelectItem value="week">
                <div className="flex flex-col">
                  <span className="font-medium">Неделя</span>
                  <span className="text-xs text-muted-foreground">Месяц → Неделя</span>
                </div>
              </SelectItem>
              <SelectItem value="month">
                <div className="flex flex-col">
                  <span className="font-medium">Месяц</span>
                  <span className="text-xs text-muted-foreground">Год → Месяц</span>
                </div>
              </SelectItem>
              <SelectItem value="quarter">
                <div className="flex flex-col">
                  <span className="font-medium">Квартал</span>
                  <span className="text-xs text-muted-foreground">Год → Квартал</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        <div className="pt-4 border-t space-y-2">
          <Label className="text-xs font-semibold">Легенда</Label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {settings.colorScheme === 'type' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span>Epic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>Story</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Task</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span>Bug</span>
                </div>
              </>
            )}
            {settings.colorScheme === 'status' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-500" />
                  <span>To Do</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Done</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>Closed</span>
                </div>
              </>
            )}
            {settings.colorScheme === 'priority' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-600" />
                  <span>Highest</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span>High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span>Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>Low</span>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
