import { useState, useEffect, type RefObject } from 'react'
import { addDays, format } from 'date-fns'
import { toast } from 'sonner'
import type { RoadmapData, RoadmapFeature } from '@/lib/schemas'

export type SectionKey = 'now' | 'next' | 'later'

export interface DragState {
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
}

export function useRoadmapDrag(
    data: RoadmapData,
    timelineRange: { start: Date; totalDays: number },
    scrollContainerRef: RefObject<HTMLDivElement | null>,
    onUpdate: (data: RoadmapData) => void
) {
    const [dragState, setDragState] = useState<DragState | null>(null)

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
            const trackWidth = trackElement?.clientWidth || 1

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
                if (newStart > newEnd) newStart = newEnd
            } else if (dragState.type === 'resize-end') {
                newEnd = addDays(dragState.initialEndDate, deltaDays)
                if (newEnd < newStart) newEnd = newStart
            }

            setDragState(prev => prev ? { ...prev, currentStartDate: newStart, currentEndDate: newEnd } : null)
        }

        const handleMouseUp = () => {
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
    }, [dragState, timelineRange, data, onUpdate, scrollContainerRef])

    return { dragState, handleDragStart }
}
