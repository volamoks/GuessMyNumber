import { Version3Client } from 'jira.js'
import { parseISO, addDays } from 'date-fns'
import type { JiraConfig, JiraIssue, GanttTask, JiraQuery, ConnectionStatus } from './jira-types'

class JiraService {
  private client: Version3Client | null = null
  private config: JiraConfig | null = null

  /**
   * Connect to JIRA instance
   */
  connect(config: JiraConfig): ConnectionStatus {
    try {
      this.config = config
      this.client = new Version3Client({
        host: config.host,
        authentication: {
          basic: {
            email: config.email,
            apiToken: config.apiToken,
          },
        },
      })

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
    if (!this.client) {
      throw new Error('Not connected to JIRA')
    }

    try {
      await this.client.myself.getCurrentUser()
      return true
    } catch (error) {
      console.error('JIRA connection test failed:', error)
      return false
    }
  }

  /**
   * Fetch issues from JIRA
   */
  async fetchIssues(query: JiraQuery): Promise<JiraIssue[]> {
    if (!this.client) {
      throw new Error('Not connected to JIRA')
    }

    try {
      const jql = query.jql || `project = ${query.projectKey} ORDER BY created DESC`

      const response = await this.client.issueSearch.searchForIssuesUsingJql({
        jql,
        maxResults: query.maxResults || 100,
        fields: [
          'summary',
          'description',
          'status',
          'assignee',
          'priority',
          'issuetype',
          'duedate',
          'customfield_10015', // Start date (may vary)
          'customfield_10016', // Story points
          'parent',
          'labels',
          'epic',
        ],
      })

      return response.issues?.map((issue: any) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: issue.fields.status.name,
        assignee: issue.fields.assignee?.displayName,
        priority: issue.fields.priority?.name,
        issueType: issue.fields.issuetype.name,
        dueDate: issue.fields.duedate,
        startDate: issue.fields.customfield_10015, // Adjust based on your JIRA setup
        estimatedHours: issue.fields.customfield_10016 ? issue.fields.customfield_10016 * 8 : undefined,
        progress: this.calculateProgress(issue.fields.status.name),
        parentKey: issue.fields.parent?.key,
        labels: issue.fields.labels || [],
        epic: issue.fields.epic?.name,
      })) || []
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
    if (!this.client) {
      throw new Error('Not connected to JIRA')
    }

    try {
      const fields: any = {}

      if (updates.summary) fields.summary = updates.summary
      if (updates.dueDate) fields.duedate = updates.dueDate
      if (updates.startDate) fields.customfield_10015 = updates.startDate
      if (updates.assignee) fields.assignee = { name: updates.assignee }

      await this.client.issues.editIssue({
        issueIdOrKey: issueKey,
        fields,
      })
    } catch (error) {
      console.error(`Failed to update issue ${issueKey}:`, error)
      throw error
    }
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<Array<{ key: string; name: string }>> {
    if (!this.client) {
      throw new Error('Not connected to JIRA')
    }

    try {
      const projects = await this.client.projects.searchProjects({})
      return projects.values?.map((p: any) => ({
        key: p.key,
        name: p.name,
      })) || []
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      throw error
    }
  }

  /**
   * Disconnect from JIRA
   */
  disconnect() {
    this.client = null
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
