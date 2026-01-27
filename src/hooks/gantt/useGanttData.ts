import { useEffect, type RefObject } from 'react'
import { gantt } from 'dhtmlx-gantt'
import type { TaskTypeColor } from '@/features/jira-gantt/components/types'

export function useGanttData(
    tasks: any[],
    getTaskColor: (task: any) => string,
    colorField: string,
    customColors: TaskTypeColor[],
    containerRef: RefObject<HTMLElement | null>
) {
    // Загрузка данных в gantt (только при изменении tasks)
    useEffect(() => {
        if (!tasks || tasks.length === 0) {
            gantt.clearAll()
            return
        }

        // Преобразуем данные в формат DHTMLX
        const ganttTasks = tasks
            .filter(task => {
                // Фильтруем задачи без валидных дат
                if (!task.start_date || !task.end_date) return false
                if (!(task.start_date instanceof Date) || !(task.end_date instanceof Date)) return false
                if (isNaN(task.start_date.getTime()) || isNaN(task.end_date.getTime())) return false
                return true
            })
            .map(task => {
                const color = getTaskColor(task)
                return {
                    id: task.id,
                    text: task.text,
                    start_date: task.start_date,
                    end_date: task.end_date,
                    duration: Math.ceil((task.end_date.getTime() - task.start_date.getTime()) / (1000 * 60 * 60 * 24)),
                    progress: task.progress || 0,
                    parent: task.parent || 0,
                    type: task.details?.issueType === 'Epic' ? gantt.config.types.project : gantt.config.types.task,
                    color: color,
                    details: task.details,
                }
            })

        // Загружаем данные
        gantt.clearAll()
        gantt.parse({ data: ganttTasks, links: [] })

        if (ganttTasks.length > 0) {
            gantt.render()
        }
    }, [tasks, getTaskColor])

    // Обновление цветов задач при изменении colorField или customColors (без перезагрузки данных)
    useEffect(() => {
        // Проверяем что gantt уже проинициализирован и есть задачи
        if (!containerRef.current || !tasks || tasks.length === 0) return

        // Обновляем цвета существующих задач
        gantt.eachTask((task: any) => {
            const newColor = getTaskColor(task)
            if (task.color !== newColor) {
                task.color = newColor
                gantt.updateTask(task.id)
            }
        })

        gantt.render()
    }, [colorField, customColors, containerRef, tasks, getTaskColor])
}
