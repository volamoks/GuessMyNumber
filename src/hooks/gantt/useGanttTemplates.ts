import { useCallback } from 'react'
import { gantt } from 'dhtmlx-gantt'

export function useGanttTemplates(
    modifiedTasks: Set<string> | undefined,
    getTaskColor: (task: any) => string
) {
    const configureTemplates = useCallback(() => {
        // Применение цветовой схемы через CSS классы
        gantt.templates.task_class = (_start, _end, task) => {
            const issueType = task.details?.issueType
            if (issueType === 'Epic') return 'gantt-epic'
            if (issueType === 'Story') return 'gantt-story'
            if (issueType === 'Bug') return 'gantt-bug'
            if (issueType === 'Task') return 'gantt-task'
            if (issueType === 'Sub-task') return 'gantt-subtask'
            return ''
        }

        gantt.templates.task_text = (_start, _end, task) => {
            return task.text
        }

        gantt.templates.task_unscheduled_time = (_task) => {
            return ''
        }

        // Кастомный тултип
        gantt.templates.tooltip_text = (_start, _end, task) => {
            const details = task.details || {}
            const isModified = modifiedTasks?.has(String(task.id))

            const formatDate = (date?: Date) => {
                if (!date || !(date instanceof Date)) return '-'
                return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            }

            let html = `
        <div class="gantt-tooltip">
          <div class="gantt-tooltip-title">${task.text || 'Untitled'}</div>
      `

            if (details.key) {
                html += `<div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Key:</span>
          <span class="gantt-tooltip-value">${details.key}</span>
        </div>`
            }

            if (details.issueType) {
                // Note: Using getTaskColor here
                const color = getTaskColor(task)
                html += `<div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Type:</span>
          <span class="gantt-tooltip-value gantt-tooltip-badge" style="background: ${color}20; color: ${color}; border: 1px solid ${color}40;">${details.issueType}</span>
        </div>`
            }

            if (details.status) {
                html += `<div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Status:</span>
          <span class="gantt-tooltip-value">${details.status}</span>
        </div>`
            }

            if (details.priority) {
                html += `<div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Priority:</span>
          <span class="gantt-tooltip-value">${details.priority}</span>
        </div>`
            }

            if (details.assignee) {
                html += `<div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Assignee:</span>
          <span class="gantt-tooltip-value">${details.assignee}</span>
        </div>`
            }

            html += `<div class="gantt-tooltip-row">
        <span class="gantt-tooltip-label">Start:</span>
        <span class="gantt-tooltip-value">${formatDate(task.start_date)}</span>
      </div>`

            html += `<div class="gantt-tooltip-row">
        <span class="gantt-tooltip-label">End:</span>
        <span class="gantt-tooltip-value">${formatDate(task.end_date)}</span>
      </div>`

            if (task.progress !== undefined) {
                html += `<div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Progress:</span>
          <span class="gantt-tooltip-value">${Math.round(task.progress * 100)}%</span>
        </div>`
            }

            if (details.description) {
                const shortDesc = details.description.length > 100
                    ? details.description.substring(0, 100) + '...'
                    : details.description
                html += `<div class="gantt-tooltip-row">
          <span class="gantt-tooltip-label">Description:</span>
          <span class="gantt-tooltip-value">${shortDesc}</span>
        </div>`
            }

            if (isModified) {
                html += `<div class="gantt-tooltip-modified">✏️ Modified locally</div>`
            }

            html += '</div>'
            return html
        }
    }, [modifiedTasks, getTaskColor])

    return configureTemplates
}
