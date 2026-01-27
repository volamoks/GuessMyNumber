import { useEffect, type RefObject } from 'react'
import { gantt } from 'dhtmlx-gantt'

export function useGanttInit(
    containerRef: RefObject<HTMLElement | null>,
    readonly: boolean,
    configureTemplates: () => void
) {
    useEffect(() => {
        if (!containerRef.current) return

        // Базовые настройки
        gantt.config.date_format = '%Y-%m-%d %H:%i'
        gantt.config.readonly = readonly
        gantt.config.show_progress = true
        gantt.config.show_links = true
        gantt.config.drag_links = !readonly
        gantt.config.drag_progress = !readonly
        gantt.config.drag_resize = !readonly
        gantt.config.drag_move = !readonly
        gantt.config.autosize = 'y'
        gantt.config.fit_tasks = true
        gantt.config.order_branch = true
        gantt.config.order_branch_free = false
        gantt.config.grid_resize = true
        gantt.config.min_column_width = 50

        // Включаем плагин tooltips
        gantt.plugins({
            tooltip: true
        })

        // Инициализация templates (один раз)
        configureTemplates()

        // Инициализация
        gantt.init(containerRef.current)

        return () => {
            gantt.clearAll()
        }
    }, [containerRef, readonly, configureTemplates])
}
