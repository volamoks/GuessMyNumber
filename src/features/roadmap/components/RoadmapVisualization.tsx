import { useMemo, useState, useRef, useEffect } from 'react'
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { RoadmapData, RoadmapFeature } from '@/lib/schemas'
import { EditableFeatureCard } from './EditableFeatureCard'
import { Dialog, DialogContent } from '@/components/ui/dialog'

import { useRoadmapTimeline, type ViewMode } from '../hooks/useRoadmapTimeline'
import { useRoadmapDrag, type SectionKey } from '../hooks/useRoadmapDrag'
import { useRoadmapOperations } from '../hooks/useRoadmapOperations'

import { RoadmapHeader } from './visualizer/RoadmapHeader'
import { TimelineHeader } from './visualizer/TimelineHeader'
import { RoadmapSidebar } from './visualizer/RoadmapSidebar'
import { RoadmapBar } from './visualizer/RoadmapBar'

interface RoadmapVisualizationProps {
  data: RoadmapData
  visualizationId: string
  onUpdate: (data: RoadmapData) => void
}

export function RoadmapVisualization({ data, visualizationId, onUpdate }: RoadmapVisualizationProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('months')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Hooks
  const { timelineRange, timeColumns, getTodayPosition, getPositionStyle } = useRoadmapTimeline(data, viewMode)
  const { dragState, handleDragStart } = useRoadmapDrag(data, timelineRange, scrollContainerRef, onUpdate)
  const { handleAddFeature, handleUpdateFeature, handleDeleteFeature } = useRoadmapOperations(data, onUpdate)

  // Edit State
  const [editingItem, setEditingItem] = useState<{ section: SectionKey, index: number, feature: RoadmapFeature } | null>(null)

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

  const scrollToToday = () => {
    if (scrollContainerRef.current) {
      const todayPos = getTodayPosition()
      const containerWidth = scrollContainerRef.current.clientWidth
      const scrollLeft = (scrollContainerRef.current.scrollWidth * (todayPos / 100)) - (containerWidth / 2)
      scrollContainerRef.current.scrollTo({ left: scrollLeft, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToToday()
  }, [])

  const todayPercent = getTodayPosition()

  return (
    <div id={visualizationId} className="h-full flex flex-col space-y-6">
      <RoadmapHeader
        data={data}
        viewMode={viewMode}
        setViewMode={setViewMode}
        scrollToToday={scrollToToday}
        handleAddFeature={handleAddFeature}
      />

      <div className="flex-1 bg-background border rounded-xl shadow-sm overflow-hidden flex flex-col select-none">
        <TimelineHeader timeColumns={timeColumns} viewMode={viewMode} />

        <div className="flex-1 flex overflow-hidden relative">
          <RoadmapSidebar allItems={allItems} onEdit={setEditingItem} />

          <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
            <div className="min-w-[800px] h-full relative timeline-track">
              {/* Background Grid */}
              <div className="absolute inset-0 flex pointer-events-none z-0">
                {timeColumns.map((_, i) => (
                  <div key={i} className="flex-1 border-r border-dashed border-border/40 last:border-r-0" />
                ))}
              </div>

              {/* Today Marker */}
              {todayPercent >= 0 && todayPercent <= 100 && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-red-500/50 z-0 pointer-events-none border-l border-red-500/50 dashed"
                  style={{ left: `${todayPercent}%` }}
                >
                  <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-red-500" />
                </div>
              )}

              {/* Rows Container */}
              <div className="pb-8 pt-0">
                {allItems.map(({ feature, section, index }) => {
                  // Check if this item is being dragged to use override dates
                  const isDraggingThis = dragState && dragState.section === section && dragState.index === index
                  const start = isDraggingThis ? dragState.currentStartDate.toISOString() : feature.startDate
                  const end = isDraggingThis ? dragState.currentEndDate.toISOString() : feature.endDate

                  const pos = getPositionStyle(start, end)

                  return (
                    <RoadmapBar
                      key={`row-${section}-${index}`}
                      feature={feature}
                      section={section}
                      index={index}
                      position={pos}
                      isDragging={!!isDraggingThis}
                      onDragStart={handleDragStart}
                      onEdit={() => setEditingItem({ section, index, feature })}
                    />
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
