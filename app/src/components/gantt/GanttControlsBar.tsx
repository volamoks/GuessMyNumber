import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Maximize2, Minimize2 } from 'lucide-react'
import { ColumnSettingsDialog } from './ColumnSettingsDialog'
import { ColorSchemeDialog } from './ColorSchemeDialog'
import { useGanttStore } from '@/store'
import { useGanttViewControls } from '@/hooks'
import type { TimeScale } from './types'

interface GanttControlsBarProps {
  tasksCount: number
}

/**
 * GanttControlsBar - Переиспользуемый компонент для controls Gantt chart
 * UI компонент без бизнес-логики, использует hooks и store
 */
export function GanttControlsBar({ tasksCount }: GanttControlsBarProps) {
  const store = useGanttStore()
  const { viewLevel, expandAll, collapseAll, changeViewLevel } = useGanttViewControls()

  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="text-sm text-muted-foreground">
        {tasksCount} tasks
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {/* View Level Select */}
        <Select value={viewLevel} onValueChange={changeViewLevel}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue placeholder="View level..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="epics">📦 Epics Only</SelectItem>
            <SelectItem value="epics-stories">📦 Epics + 📖 Stories</SelectItem>
            <SelectItem value="epics-stories-tasks">📦 Epics + 📖 Stories + ✓ Tasks</SelectItem>
            <SelectItem value="all">🌳 Show All (with Subtasks)</SelectItem>
          </SelectContent>
        </Select>

        {/* Timeline Scale */}
        <Select value={store.timeScale} onValueChange={(val) => store.setTimeScale(val as TimeScale)}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="quarter">Quarter</SelectItem>
          </SelectContent>
        </Select>

        {/* Column Settings */}
        <ColumnSettingsDialog
          columns={store.columns}
          onColumnsChange={store.setColumns}
        />

        {/* Color Scheme */}
        <ColorSchemeDialog
          colorField={store.colorField}
          onColorFieldChange={store.setColorField}
          colors={store.customColors}
          onColorsChange={store.setCustomColors}
        />

        {/* Expand/Collapse Buttons */}
        <Button
          onClick={expandAll}
          variant="outline"
          size="sm"
          title="Expand all"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          onClick={collapseAll}
          variant="outline"
          size="sm"
          title="Collapse all"
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
