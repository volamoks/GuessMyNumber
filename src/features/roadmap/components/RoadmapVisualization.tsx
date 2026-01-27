import { useMemo, useState, useRef, useEffect } from 'react'
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { RoadmapData, RoadmapFeature } from '@/lib/schemas'
import { EditableFeatureCard } from './EditableFeatureCard'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Plus, Target, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  addMonths,
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
  differenceInDays,
  min,
  isValid,
  startOfQuarter,
  endOfQuarter,
  eachQuarterOfInterval,
  isSameMonth,
  isSameQuarter,
  addQuarters,
  addDays
} from 'date-fns'
import { Dialog, DialogContent } from '@/components/ui/dialog'

interface RoadmapVisualizationProps {
  data: RoadmapData
  visualizationId: string
  onUpdate: (data: RoadmapData) => void
}

type SectionKey = 'now' | 'next' | 'later'
type ViewMode = 'months' | 'quarters'

export function RoadmapVisualization({ data, visualizationId, onUpdate }: RoadmapVisualizationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('months')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Edit State
  const [editingItem, setEditingItem] = useState<{ section: SectionKey, index: number, feature: RoadmapFeature } | null>(null)

  // Drag State
  const [dragState, setDragState] = useState<{
    isDragging: boolean
    type: 'move' | 'resize-start' | 'resize-end' | null
    feature?: RoadmapFeature
    section?: SectionKey
    index?: number
    initialX: number
    initialStartDate: Date
    initialEndDate: Date
    currentStartDate: Date
    currentEndDate: Date
  } | null>(null)

  // Calculate Timeline Bounds
  const timelineRange = useMemo(() => {
    // Collect all valid dates
    const allDates: Date[] = []
      ; (['now', 'next', 'later'] as const).forEach(section => {
        (data[section] || []).forEach(item => {
          if (item.startDate) allDates.push(new Date(item.startDate))
          if (item.endDate) allDates.push(new Date(item.endDate))
        })
      })

    const today = new Date()
    const startDate = allDates.length > 0 ? min([today, ...allDates]) : today

    // Calculate start/end with some buffer
    let start = viewMode === 'quarters' ? startOfQuarter(addQuarters(startDate, -1)) : startOfMonth(addMonths(startDate, -1))
    let end = viewMode === 'quarters' ? endOfQuarter(addQuarters(start, 4)) : endOfMonth(addMonths(start, 12)) // Default 1 year view

    // Verify valid range
    if (differenceInDays(end, start) < 30) {
      end = addMonths(start, 6)
    }

    return {
      start,
      end,
      totalDays: differenceInDays(end, start) + 1
    }
  }, [data, viewMode])

  const timeColumns = useMemo(() => {
    if (viewMode === 'quarters') {
      return eachQuarterOfInterval({
        start: timelineRange.start,
        end: timelineRange.end
      })
    }
    return eachMonthOfInterval({
      start: timelineRange.start,
      end: timelineRange.end
    })
  }, [timelineRange, viewMode])

  // Flatten items for rendering
  const allItems = useMemo(() => {
    const items: { feature: RoadmapFeature, section: SectionKey, index: number }[] = []
      ; (['now', 'next', 'later'] as const).forEach(section => {
        (data[section] || []).forEach((feature, index) => {
          items.push({ feature, section, index })
        })
      })
    return items.sort((a, b) => {
      const dateA = a.feature.startDate ? new Date(a.feature.startDate).getTime() : 0
      const dateB = b.feature.startDate ? new Date(b.feature.startDate).getTime() : 0
      return dateA - dateB
    })
  }, [data])

  // Drag Handlers
  const handleDragStart = (
    e: React.MouseEvent,
    type: 'move' | 'resize-start' | 'resize-end',
    feature: RoadmapFeature,
    section: SectionKey,
    index: number
  ) => {
    e.preventDefault()
    e.stopPropagation()

    if (!feature.startDate || !feature.endDate) return

    setDragState({
      isDragging: true,
      type,
      feature,
      section,
      index,
      initialX: e.clientX,
      initialStartDate: new Date(feature.startDate),
      initialEndDate: new Date(feature.endDate),
      currentStartDate: new Date(feature.startDate),
      currentEndDate: new Date(feature.endDate)
    })
  }

  useEffect(() => {
    if (!dragState?.isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollContainerRef.current) return

      const deltaX = e.clientX - dragState.initialX
      const trackElement = scrollContainerRef.current.querySelector('.timeline-track')
      const trackWidth = trackElement?.clientWidth || 1 // Fallback to 1 to prevent division by zero

      const pixelsPerDay = trackWidth / timelineRange.totalDays

      const deltaDays = Math.round(deltaX / pixelsPerDay)

      if (deltaDays === 0) return

      let newStart = dragState.initialStartDate
      let newEnd = dragState.initialEndDate

      if (dragState.type === 'move') {
        newStart = addDays(dragState.initialStartDate, deltaDays)
        newEnd = addDays(dragState.initialEndDate, deltaDays)
      } else if (dragState.type === 'resize-start') {
        newStart = addDays(dragState.initialStartDate, deltaDays)
        // Prevent end > start
        if (newStart > newEnd) newStart = newEnd
      } else if (dragState.type === 'resize-end') {
        newEnd = addDays(dragState.initialEndDate, deltaDays)
        // Prevent start > end
        if (newEnd < newStart) newEnd = newStart
      }

      setDragState(prev => prev ? { ...prev, currentStartDate: newStart, currentEndDate: newEnd } : null)
    }

    const handleMouseUp = () => {
      // Commit changes
      if (dragState.feature && dragState.section && dragState.index !== undefined) {
        const updatedFeature = {
          ...dragState.feature,
          startDate: format(dragState.currentStartDate, 'yyyy-MM-dd'),
          endDate: format(dragState.currentEndDate, 'yyyy-MM-dd')
        }
        const newData = { ...data }
        newData[dragState.section][dragState.index] = updatedFeature
        onUpdate(newData)
        toast.success('Feature updated')
      }
      setDragState(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, timelineRange, data, onUpdate])


  // Handlers
  const handleUpdateFeature = (section: SectionKey, index: number, updatedFeature: RoadmapFeature) => {
    const newData = { ...data }
    newData[section][index] = updatedFeature
    onUpdate(newData)
    toast.success('Feature updated')
  }

  const handleDeleteFeature = (section: SectionKey, index: number) => {
    if (!confirm('Delete this feature?')) return
    const newData = { ...data }
    newData[section] = newData[section].filter((_, i) => i !== index)
    onUpdate(newData)
    toast.success('Feature deleted')
  }

  const handleAddFeature = () => {
    // Default to 'now' or maybe we need a general "Add" that asks?
    // For simplicity, add to 'now' and let user move it (which effectively means changing dates)
    const newData = { ...data }
    const newFeature: RoadmapFeature = {
      title: 'New Task',
      description: '',
      priority: 'medium',
      status: 'planning',
      category: 'feature',
      effort: 'medium',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd')
    }
    newData['now'] = [...(newData['now'] || []), newFeature]
    onUpdate(newData)
    toast.success('New task added')
  }

  // Helpers
  const getPositionStyle = (startStr?: string | null, endStr?: string | null) => {
    const start = (startStr && isValid(new Date(startStr))) ? new Date(startStr!) : new Date()
    const end = (endStr && isValid(new Date(endStr))) ? new Date(endStr!) : addMonths(start, 1)

    const offsetDays = differenceInDays(start, timelineRange.start)
    const durationDays = differenceInDays(end, start) || 1

    // Limits
    const leftRaw = (offsetDays / timelineRange.totalDays) * 100
    const widthRaw = (durationDays / timelineRange.totalDays) * 100

    return {
      left: `${Math.max(0, Math.min(100, leftRaw))}%`,
      width: `${Math.max(0.5, Math.min(100 - leftRaw, widthRaw))}%`
    }
  }

  const getTodayPosition = () => {
    const today = new Date()
    const offset = differenceInDays(today, timelineRange.start)
    const percent = (offset / timelineRange.totalDays) * 100
    return Math.max(0, Math.min(100, percent))
  }

  const scrollToToday = () => {
    if (scrollContainerRef.current) {
      const todayPos = getTodayPosition()
      const containerWidth = scrollContainerRef.current.clientWidth
      // Scroll to center today
      const scrollLeft = (scrollContainerRef.current.scrollWidth * (todayPos / 100)) - (containerWidth / 2)
      scrollContainerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }

  // Effect to scroll to today on mount
  useEffect(() => {
    scrollToToday()
  }, [])

  const todayPercent = getTodayPosition()

  return (
    <div id={visualizationId} className="h-full flex flex-col space-y-6">

      {/* Header Info & Controls */}
      <div className="flex-none px-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{data.title}</h2>
          {data.description && <p className="text-muted-foreground">{data.description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
            <Button
              variant={viewMode === 'months' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setViewMode('months')}
            >
              Months
            </Button>
            <Button
              variant={viewMode === 'quarters' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setViewMode('quarters')}
            >
              Quarters
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={scrollToToday} title="Go to Today">
            <Target className="h-4 w-4 mr-2" /> Today
          </Button>

          <Button onClick={handleAddFeature} size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Task
          </Button>
        </div>
      </div>

      {/* GANTT CONTAINER */}
      <div className="flex-1 bg-background border rounded-xl shadow-sm overflow-hidden flex flex-col select-none"> {/* Added select-none */}

        {/* HEADER ROW */}
        <div className="flex-none h-12 border-b bg-muted/30 flex items-center z-30">
          <div className="w-64 flex-shrink-0 border-r px-4 font-semibold text-sm text-muted-foreground bg-background/50 backdrop-blur sticky left-0 z-40 h-full flex items-center shadow-sm">
            Task Name
          </div>
          <div className="flex-1 relative h-full overflow-hidden">
            <div className="absolute inset-0 flex">
              {timeColumns.map((date, i) => (
                <div key={i} className="flex-1 border-r last:border-r-0 flex items-center justify-center text-xs font-medium text-muted-foreground uppercase tracking-wider relative group">
                  <span className={isSameMonth(date, new Date()) || (viewMode === 'quarters' && isSameQuarter(date, new Date())) ? "text-primary font-bold" : ""}>
                    {viewMode === 'quarters' ? `Q${Math.floor(date.getMonth() / 3) + 1} '${format(date, 'yy')}` : format(date, 'MMM yy')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 flex overflow-hidden relative">

          {/* LEFT FIXED PANEL */}
          <div className="w-64 flex-shrink-0 border-r bg-background z-20 overflow-y-auto overflow-x-hidden relative shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] scrollbar-hide">
            <div className="min-h-full pb-8">
              <div className="h-0" />
              {allItems.map(({ feature, section, index }) => (
                <div
                  key={`sidebar-${section}-${index}`}
                  className="h-11 border-b px-4 flex items-center justify-between text-sm hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => setEditingItem({ section, index, feature })}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full flex-shrink-0",
                      feature.priority === 'high' ? "bg-red-500" : feature.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                    )} />
                    <span className="truncate font-medium group-hover:text-primary transition-colors">{feature.title}</span>
                    <span className="opacity-0 group-hover:opacity-50 ml-2 text-[10px] uppercase border px-1 rounded">Edit</span>
                  </div>
                </div>
              ))}
              {allItems.length === 0 && <div className="p-4 text-xs text-muted-foreground">No tasks</div>}
            </div>
          </div>

          {/* RIGHT SCROLLABLE PANEL */}
          <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
            {/* Class 'timeline-track' used for width measurement */}
            <div className="min-w-[800px] h-full relative timeline-track">

              {/* Background Grid */}
              <div className="absolute inset-0 flex pointer-events-none z-0">
                {
                  timeColumns.map((_, i) => (
                    <div key={i} className="flex-1 border-r border-dashed border-border/40 last:border-r-0" />
                  ))
                }
              </div>

              {/* Today Marker */}
              {
                todayPercent >= 0 && todayPercent <= 100 && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-500/50 z-0 pointer-events-none border-l border-red-500/50 dashed"
                    style={{ left: `${todayPercent}%` }}
                  >
                    <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-red-500" />
                  </div>
                )
              }

              {/* Rows Container */}
              <div className="pb-8 pt-0">
                {allItems.map(({ feature, section, index }) => {

                  // Check if this item is being dragged to use override dates
                  const isDraggingThis = dragState && dragState.section === section && dragState.index === index
                  const start = isDraggingThis ? dragState.currentStartDate.toISOString() : feature.startDate
                  const end = isDraggingThis ? dragState.currentEndDate.toISOString() : feature.endDate

                  const pos = getPositionStyle(start, end)

                  return (
                    <div key={`row-${section}-${index}`} className="h-11 border-b border-transparent relative group hover:bg-muted/5 w-full">
                      <div className="absolute inset-0 border-b opacity-50 pointer-events-none" />

                      {/* Bar Wrapper */}
                      <div className="relative w-full h-full">

                        {/* THE BAR */}
                        <div
                          className={cn(
                            "absolute top-2 h-7 rounded-sm shadow-sm border text-[10px] px-2 flex items-center transition-all overflow-hidden whitespace-nowrap bg-primary/90 text-primary-foreground z-10",
                            !feature.startDate && "border-dashed opacity-70 bg-muted text-muted-foreground",
                            // Dragging styles
                            isDraggingThis ? "cursor-grabbing shadow-lg scale-[1.02] ring-2 ring-primary ring-offset-1 z-50" : "hover:shadow-md hover:scale-[1.01] hover:bg-primary cursor-grab"
                          )}
                          style={{
                            left: pos.left,
                            width: pos.width,
                            minWidth: '24px'
                          }}
                          onMouseDown={(e) => handleDragStart(e, 'move', feature, section, index)}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            setEditingItem({ section, index, feature })
                          }}
                        >

                          {/* Resize Handle LEFT */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-black/20 z-20"
                            onMouseDown={(e) => handleDragStart(e, 'resize-start', feature, section, index)}
                          />

                          {/* Grip Icon (Visual only) */}
                          <GripVertical className="h-3 w-3 mr-1 opacity-50 flex-shrink-0" />

                          <span className="truncate font-medium mix-blend-difference text-white/90 pointer-events-none select-none">{feature.title}</span>

                          {/* Resize Handle RIGHT */}
                          <div
                            className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-black/20 z-20"
                            onMouseDown={(e) => handleDragStart(e, 'resize-end', feature, section, index)}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-xl">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Edit Task</CardTitle>
            <CardDescription>Update details for {editingItem?.feature.title}</CardDescription>
          </CardHeader>
          <div className="py-2">
            {editingItem && (
              <EditableFeatureCard
                feature={editingItem.feature}
                onUpdate={(updated) => {
                  handleUpdateFeature(editingItem.section, editingItem.index, updated)
                  setEditingItem(null)
                }}
                onDelete={() => {
                  handleDeleteFeature(editingItem.section, editingItem.index)
                  setEditingItem(null)
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
