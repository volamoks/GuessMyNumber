import { parseISO, addDays } from 'date-fns'
import type { JiraConfig, JiraIssue, GanttTask, JiraQuery, ConnectionStatus } from './jira-types'

// Use Vercel API routes in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_JIRA_PROXY_URL ||
                     (import.meta.env.PROD ? '/api/jira' : 'http://localhost:3001/api/jira')

class JiraService {
  private config: JiraConfig | null = null

  /**
   * Connect to JIRA instance (via backend proxy)
   */
  async connect(config: JiraConfig): Promise<ConnectionStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return {
          connected: false,
          error: data.error || 'Connection failed',
        }
      }

      this.config = config

      return {
        connected: true,
        host: config.host,
        email: config.email,
        lastSync: new Date(),
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Connection failed',
      }
    }
  }

  /**
   * Test connection to JIRA
   */
  async testConnection(): Promise<boolean> {
    if (!this.config) {
      throw new Error('Not connected to JIRA')
    }

    try {
      const status = await this.connect(this.config)
      return status.connected
    } catch (error) {
      console.error('JIRA connection test failed:', error)
      return false
    }
  }

  /**
   * Fetch issues from JIRA
   */
  async fetchIssues(query: JiraQuery): Promise<JiraIssue[]> {
    if (!this.config) {
      throw new Error('Not connected to JIRA')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...this.config,
          ...query,
        }),
      })

      const data = await response.json()

      console.log('===== FULL API RESPONSE =====')
      console.log('Response keys:', Object.keys(data))
      console.log('Has debug?', 'debug' in data)
      console.log('Full data:', data)
      console.log('============================')

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch issues')
      }

      console.log('===== JIRA API RESPONSE =====')
      console.log('First issue from API:', data.issues?.[0])
      console.log('Fields available:', data.issues?.[0] ? Object.keys(data.issues[0]) : 'no issues')

      // Log debug information from backend
      if (data.debug) {
        console.log('\n===== RAW JIRA DEBUG INFO =====')
        console.log('Raw fields count:', data.debug.rawFieldsCount)
        console.log('Raw field names:', data.debug.rawFieldNames)
        console.log('Raw first issue from JIRA:', data.debug.rawFirstIssue)
        console.log('Raw components:', data.debug.rawFirstIssue?.fields?.components)
        console.log('================================')
      } else {
        console.log('⚠️ No debug section in response - API may have failed or not deployed')
      }

      return data.issues || []
    } catch (error) {
      console.error('Failed to fetch JIRA issues:', error)
      throw error
    }
  }

  /**
   * Transform JIRA issues to Gantt tasks (including subtasks)
   */
  transformToGanttTasks(issues: JiraIssue[]): GanttTask[] {
    const tasks: GanttTask[] = []

    console.log('===== TRANSFORM TO GANTT =====')
    console.log('First issue to transform:', issues[0])

    issues.forEach((issue) => {
      // Parse and validate dates
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

      // Ensure end date is after start date
      if (endDate <= startDate) {
        endDate = addDays(startDate, 1)
      }

      const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

      // Add main issue as task
      // Добавляем эмодзи для типов задач
      const typeEmoji = issue.issueType === 'Epic' ? '📦' :
                        issue.issueType === 'Story' ? '📖' :
                        issue.issueType === 'Bug' ? '🐛' :
                        issue.issueType === 'Task' ? '✓' : '•'

      const taskDetails = {
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

      if (tasks.length === 0) {
        console.log('First task details:', taskDetails)
      }

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
        issue.subtasks.forEach((subtask, index) => {
          // Subtasks inherit parent's timeframe but divided proportionally
          const subtaskDuration = Math.max(1, Math.floor(duration / issue.subtasks!.length))
          const subtaskStart = addDays(startDate, index * subtaskDuration)
          const subtaskEnd = addDays(subtaskStart, subtaskDuration)

          tasks.push({
            id: subtask.key,
            text: `  └ 📝 ${subtask.key}: ${subtask.summary}`,
            start_date: subtaskStart,
            end_date: subtaskEnd,
            duration: subtaskDuration,
            progress: this.calculateProgress(subtask.status),
            parent: issue.key, // Link to parent task
            type: 'task',
            open: true,
            details: {
              key: subtask.key,
              summary: subtask.summary,
              status: subtask.status,
              issueType: subtask.issueType,
              // Наследуем от родителя
              priority: issue.priority,
              assignee: issue.assignee,
              reporter: issue.reporter,
              labels: issue.labels,
              components: issue.components,
            },
          })
        })
      }
    })

    return tasks
  }

  /**
   * Update issue in JIRA (for 2-way sync)
   */
  async updateIssue(issueKey: string, updates: Partial<JiraIssue>): Promise<void> {
    if (!this.config) {
      throw new Error('Not connected to JIRA')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/update-issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...this.config,
          issueKey,
          updates,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update issue')
      }
    } catch (error) {
      console.error(`Failed to update issue ${issueKey}:`, error)
      throw error
    }
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<Array<{ key: string; name: string }>> {
    if (!this.config) {
      throw new Error('Not connected to JIRA')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.config),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch projects')
      }

      return data.projects || []
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      throw error
    }
  }

  /**
   * Disconnect from JIRA
   */
  disconnect() {
    this.config = null
  }

  /**
   * Get current config
   */
  getConfig(): JiraConfig | null {
    return this.config
  }

  // Helper methods
  private calculateProgress(status: string): number {
    const statusMap: Record<string, number> = {
      'To Do': 0,
      'In Progress': 50,
      'Done': 100,
      'Closed': 100,
    }
    return statusMap[status] || 0
  }

  private getTaskType(issueType: string): 'task' | 'project' | 'milestone' {
    if (issueType === 'Epic') return 'project'
    if (issueType === 'Story' || issueType === 'Task') return 'task'
    return 'task'
  }
}

// Export singleton instance
export const jiraService = new JiraService()
