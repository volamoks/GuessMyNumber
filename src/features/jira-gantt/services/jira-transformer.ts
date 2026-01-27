import { parseISO, addDays } from 'date-fns'
import type { JiraIssue, GanttTask } from '../types'

export class JiraTransformer {
    /**
     * Transform JIRA issues to Gantt tasks (including subtasks)
     */
    public static transformToGanttTasks(issues: JiraIssue[]): GanttTask[] {
        const tasks: GanttTask[] = []

        issues.forEach((issue) => {
            const { startDate, endDate, duration } = this.calculateTaskDates(issue)
            const typeEmoji = this.getIssueTypeEmoji(issue.issueType)

            const taskDetails = this.extractTaskDetails(issue)

            tasks.push({
                id: issue.key,
                text: `${typeEmoji} ${issue.key}: ${issue.summary}`,
                start_date: startDate,
                end_date: endDate,
                duration,
                progress: this.calculateProgress(issue.status),
                parent: issue.parentKey,
                type: this.getTaskType(issue.issueType),
                open: true,
                details: taskDetails,
            })

            // Add subtasks
            if (issue.subtasks && issue.subtasks.length > 0) {
                this.addSubtasks(tasks, issue, startDate, duration)
            }
        })

        return tasks
    }

    private static calculateTaskDates(issue: JiraIssue) {
        let startDate: Date
        if (issue.startDate) {
            const parsed = parseISO(issue.startDate)
            startDate = isNaN(parsed.getTime()) ? new Date() : parsed
        } else {
            startDate = new Date()
        }

        let endDate: Date
        if (issue.dueDate) {
            const parsed = parseISO(issue.dueDate)
            if (isNaN(parsed.getTime())) {
                endDate = addDays(startDate, issue.estimatedHours ? Math.ceil(issue.estimatedHours / 8) : 5)
            } else {
                endDate = parsed
            }
        } else {
            endDate = addDays(startDate, issue.estimatedHours ? Math.ceil(issue.estimatedHours / 8) : 5)
        }

        if (endDate <= startDate) {
            endDate = addDays(startDate, 1)
        }

        const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

        return { startDate, endDate, duration }
    }

    private static getIssueTypeEmoji(issueType: string): string {
        switch (issueType) {
            case 'Epic': return '📦'
            case 'Story': return '📖'
            case 'Bug': return '🐛'
            case 'Task': return '✓'
            default: return '•'
        }
    }

    private static getTaskType(issueType: string): 'task' | 'project' | 'milestone' {
        if (issueType === 'Epic') return 'project'
        return 'task'
    }

    private static calculateProgress(status: string): number {
        const statusMap: Record<string, number> = {
            'To Do': 0,
            'In Progress': 50,
            'Done': 100,
            'Closed': 100,
        }
        return statusMap[status] || 0
    }

    private static extractTaskDetails(issue: JiraIssue) {
        return {
            key: issue.key,
            summary: issue.summary,
            status: issue.status,
            assignee: issue.assignee,
            reporter: issue.reporter,
            priority: issue.priority,
            issueType: issue.issueType,
            description: issue.description,
            labels: issue.labels,
            components: issue.components,
            resolution: issue.resolution,
            epic: issue.epic,
            sprint: issue.sprint,
            createdDate: issue.createdDate,
            updatedDate: issue.updatedDate,
            estimatedHours: issue.estimatedHours,
            remainingHours: issue.remainingHours,
        }
    }

    private static addSubtasks(tasks: GanttTask[], parentIssue: JiraIssue, parentStart: Date, parentDuration: number) {
        if (!parentIssue.subtasks) return

        parentIssue.subtasks.forEach((subtask, index) => {
            const subtaskDuration = Math.max(1, Math.floor(parentDuration / parentIssue.subtasks!.length))
            const subtaskStart = addDays(parentStart, index * subtaskDuration)
            const subtaskEnd = addDays(subtaskStart, subtaskDuration)

            tasks.push({
                id: subtask.key,
                text: `  └ 📝 ${subtask.key}: ${subtask.summary}`,
                start_date: subtaskStart,
                end_date: subtaskEnd,
                duration: subtaskDuration,
                progress: this.calculateProgress(subtask.status),
                parent: parentIssue.key,
                type: 'task',
                open: true,
                details: {
                    key: subtask.key,
                    summary: subtask.summary,
                    status: subtask.status,
                    issueType: subtask.issueType,
                    priority: parentIssue.priority,
                    assignee: parentIssue.assignee,
                    reporter: parentIssue.reporter,
                    labels: parentIssue.labels,
                    components: parentIssue.components,
                },
            })
        })
    }
}
