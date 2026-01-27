import { useCallback, useEffect, type RefObject } from 'react'
import { gantt } from 'dhtmlx-gantt'
import type { GanttColumn } from '@/features/jira-gantt/components/types'

export function useGanttColumns(
    columns: GanttColumn[],
    readonly: boolean,
    getTaskColor: (task: any) => string,
    containerRef: RefObject<HTMLElement | null>
) {
    const configureColumns = useCallback(() => {
        const visibleColumns = columns
            .filter(col => col.visible)
            .map(col => {
                const columnConfig: any = {
                    name: col.name,
                    label: col.label,
                    tree: col.id === 'text',
                    width: col.width,
                    resize: col.resize,
                    align: col.align
                }

                // Добавляем template для кастомных полей
                switch (col.id) {
                    case 'key':
                        columnConfig.template = (task: any) => task.details?.key || ''
                        break
                    case 'assignee':
                        columnConfig.template = (task: any) => task.details?.assignee || ''
                        break
                    case 'reporter':
                        columnConfig.template = (task: any) => task.details?.reporter || ''
                        break
                    case 'priority':
                        columnConfig.template = (task: any) => task.details?.priority || ''
                        break
                    case 'status':
                        columnConfig.template = (task: any) => task.details?.status || ''
                        break
                    case 'issueType':
                        columnConfig.template = (task: any) => {
                            const issueType = task.details?.issueType || ''
                            if (!issueType) return ''
                            const color = getTaskColor(task)
                            return `<div style="background-color: ${color}; color: white; padding: 4px 8px; border-radius: 4px; text-align: center; font-weight: 500; display: inline-block; min-width: 80px;">${issueType}</div>`
                        }
                        break
                    case 'labels':
                        columnConfig.template = (task: any) => {
                            const labels = task.details?.labels || []
                            return Array.isArray(labels) ? labels.join(', ') : ''
                        }
                        break
                    case 'components':
                        columnConfig.template = (task: any) => {
                            const components = task.details?.components || []
                            return Array.isArray(components) ? components.join(', ') : ''
                        }
                        break
                    case 'description':
                        columnConfig.template = (task: any) => {
                            const desc = task.details?.description || ''
                            return desc.length > 50 ? desc.substring(0, 50) + '...' : desc
                        }
                        break
                    case 'epic':
                        columnConfig.template = (task: any) => task.details?.epic || ''
                        break
                    case 'sprint':
                        columnConfig.template = (task: any) => task.details?.sprint || ''
                        break
                    case 'resolution':
                        columnConfig.template = (task: any) => task.details?.resolution || ''
                        break
                    case 'estimatedHours':
                        columnConfig.template = (task: any) => {
                            const hours = task.details?.estimatedHours
                            return hours !== null && hours !== undefined ? `${hours}h` : ''
                        }
                        break
                    case 'remainingHours':
                        columnConfig.template = (task: any) => {
                            const hours = task.details?.remainingHours
                            return hours !== null && hours !== undefined ? `${hours}h` : ''
                        }
                        break
                    case 'createdDate':
                        columnConfig.template = (task: any) => {
                            const date = task.details?.createdDate
                            return date ? new Date(date).toLocaleDateString() : ''
                        }
                        break
                    case 'updatedDate':
                        columnConfig.template = (task: any) => {
                            const date = task.details?.updatedDate
                            return date ? new Date(date).toLocaleDateString() : ''
                        }
                        break
                    case 'progress':
                        columnConfig.template = (task: any) => {
                            const progress = task.progress || 0
                            return `${Math.round(progress * 100)}%`
                        }
                        break
                }

                return columnConfig
            })

        // Добавляем колонку "add" если не readonly
        if (!readonly) {
            visibleColumns.push({
                name: 'add',
                label: '',
                tree: false,
                width: 44,
                resize: false,
                align: 'center'
            })
        }

        gantt.config.columns = visibleColumns as any
    }, [columns, readonly, getTaskColor])

    // Обновление колонок
    useEffect(() => {
        configureColumns()
        if (containerRef.current) {
            gantt.render()
        }
    }, [columns, readonly, configureColumns, containerRef])

    return configureColumns // Return if needed manually
}
