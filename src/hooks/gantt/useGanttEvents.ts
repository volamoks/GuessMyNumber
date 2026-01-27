import { useEffect } from 'react'
import { gantt } from 'dhtmlx-gantt'

export function useGanttEvents(
    onTaskUpdate: ((id: string, updates: any) => void) | undefined,
    readonly: boolean
) {
    useEffect(() => {
        if (!onTaskUpdate) return

        const handleAfterTaskDrag = (id: string, _mode: string, task: any) => {
            if (readonly) return
            onTaskUpdate(id, {
                start_date: task.start_date,
                end_date: task.end_date,
                progress: task.progress,
            })
        }

        const handleAfterTaskUpdate = (id: string, task: any) => {
            if (readonly) return
            onTaskUpdate(id, {
                start_date: task.start_date,
                end_date: task.end_date,
                progress: task.progress,
            })
        }

        gantt.attachEvent('onAfterTaskDrag', handleAfterTaskDrag)
        gantt.attachEvent('onAfterTaskUpdate', handleAfterTaskUpdate)

        return () => {
            gantt.detachEvent('onAfterTaskDrag')
            gantt.detachEvent('onAfterTaskUpdate')
        }
    }, [onTaskUpdate, readonly])
}
