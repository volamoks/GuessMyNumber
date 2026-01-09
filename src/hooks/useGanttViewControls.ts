import { useCallback } from 'react'
import { gantt } from 'dhtmlx-gantt'
import { useGanttStore } from '@/store'

/**
 * useGanttViewControls - Hook для UI логики управления представлением Gantt
 * Инкапсулирует expand/collapse/viewLevel логику
 */
export function useGanttViewControls() {
  const store = useGanttStore()

  // Expand all tasks
  const expandAll = useCallback(() => {
    gantt.eachTask((task) => {
      task.$open = true
    })
    gantt.render()
  }, [])

  // Collapse all tasks
  const collapseAll = useCallback(() => {
    gantt.eachTask((task) => {
      task.$open = false
    })
    gantt.render()
  }, [])

  // Change view level (hierarchical collapse)
  const changeViewLevel = useCallback((level: string) => {
    store.setViewLevel(level)

    gantt.eachTask((task) => {
      const issueType = task.details?.issueType

      switch(level) {
        case 'epics':
          // Show only Epics
          task.$open = false
          break
        case 'epics-stories':
          // Epics expanded, Stories visible but collapsed
          if (issueType === 'Epic') {
            task.$open = true
          } else {
            task.$open = false
          }
          break
        case 'epics-stories-tasks':
          // Epics and Stories expanded, Tasks visible
          if (issueType === 'Epic' || issueType === 'Story') {
            task.$open = true
          } else {
            task.$open = false
          }
          break
        case 'all':
          // Everything expanded
          task.$open = true
          break
        default:
          task.$open = false
      }
    })

    gantt.render()
  }, [store])

  return {
    viewLevel: store.viewLevel,
    expandAll,
    collapseAll,
    changeViewLevel,
  }
}
