import { parseISO, addDays } from 'date-fns'
import type { JiraConfig, JiraIssue, GanttTask, JiraQuery, ConnectionStatus } from './jira-types'

const API_BASE_URL = import.meta.env.VITE_JIRA_PROXY_URL || 'http://localhost:3001/api/jira'

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

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch issues')
      }

      return data.issues || []
    } catch (error) {
      console.error('Failed to fetch JIRA issues:', error)
      throw error
    }
  }

  /**
   * Transform JIRA issues to Gantt tasks
   */
  transformToGanttTasks(issues: JiraIssue[]): GanttTask[] {
    return issues.map((issue) => {
      const startDate = issue.startDate ? parseISO(issue.startDate) : new Date()
      const endDate = issue.dueDate
        ? parseISO(issue.dueDate)
        : addDays(startDate, issue.estimatedHours ? Math.ceil(issue.estimatedHours / 8) : 5)

      const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))

      return {
        id: issue.key,
        text: `${issue.key}: ${issue.summary}`,
        start_date: startDate,
        end_date: endDate,
        duration,
        progress: (issue.progress || 0) / 100,
        parent: issue.parentKey,
        type: this.getTaskType(issue.issueType),
        open: true,
        details: {
          key: issue.key,
          status: issue.status,
          assignee: issue.assignee,
          priority: issue.priority,
          issueType: issue.issueType,
          description: issue.description,
          labels: issue.labels,
        },
      }
    })
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
