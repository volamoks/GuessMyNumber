import { useCallback, useEffect, type RefObject } from 'react'
import { gantt } from 'dhtmlx-gantt'
import type { TimeScale } from '@/features/jira-gantt/components/types'

export function useGanttTimeScale(timeScale: TimeScale, containerRef: RefObject<HTMLElement | null>) {
    const configureTimeScale = useCallback(() => {
        switch (timeScale) {
            case 'day':
                gantt.config.scales = [
                    { unit: 'month', step: 1, format: '%F %Y' },
                    { unit: 'day', step: 1, format: '%d' }
                ]
                break
            case 'week':
                gantt.config.scales = [
                    { unit: 'month', step: 1, format: '%F %Y' },
                    { unit: 'week', step: 1, format: 'Week #%W' }
                ]
                break
            case 'month':
                gantt.config.scales = [
                    { unit: 'year', step: 1, format: '%Y' },
                    { unit: 'month', step: 1, format: '%M' }
                ]
                break
            case 'quarter':
                gantt.config.scales = [
                    { unit: 'year', step: 1, format: '%Y' },
                    { unit: 'quarter', step: 1, format: 'Q%q' }
                ]
                break
        }
        gantt.config.scale_height = 50
    }, [timeScale])

    useEffect(() => {
        configureTimeScale()
        if (containerRef.current) {
            gantt.render()
        }
    }, [timeScale, configureTimeScale, containerRef])
}
