import { useMemo, useCallback } from 'react'
import {
    startOfMonth,
    endOfMonth,
    addMonths,
    differenceInDays,
    min,
    startOfQuarter,
    endOfQuarter,
    addQuarters,
    eachQuarterOfInterval,
    eachMonthOfInterval,
    isValid,
} from 'date-fns'
import type { RoadmapData } from '@/lib/schemas'

export type ViewMode = 'months' | 'quarters'

export function useRoadmapTimeline(data: RoadmapData, viewMode: ViewMode) {
    // Calculate Timeline Bounds
    const timelineRange = useMemo(() => {
        // Collect all valid dates
        const allDates: Date[] = [];
        (['now', 'next', 'later'] as const).forEach(section => {
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

    const getTodayPosition = useCallback(() => {
        const today = new Date()
        const offset = differenceInDays(today, timelineRange.start)
        const percent = (offset / timelineRange.totalDays) * 100
        return Math.max(0, Math.min(100, percent))
    }, [timelineRange])

    const getPositionStyle = useCallback((startStr?: string | null, endStr?: string | null) => {
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
    }, [timelineRange])

    return {
        timelineRange,
        timeColumns,
        getTodayPosition,
        getPositionStyle
    }
}
