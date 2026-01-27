import type { JiraConfig, JiraIssue, GanttTask, JiraQuery, ConnectionStatus } from '../types'
import { JiraTransformer } from './jira-transformer'
import { API_ENDPOINTS } from '@/constants/api'

const API_BASE_URL = import.meta.env.VITE_JIRA_PROXY_URL || API_ENDPOINTS.JIRA.BASE

class JiraService {
  private config: JiraConfig | null = null

  async connect(config: JiraConfig): Promise<ConnectionStatus> {
    try {
      const response = await fetch(`${API_BASE_URL}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { connected: false, error: data.error || 'Connection failed' }
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

  async testConnection(): Promise<boolean> {
    if (!this.config) throw new Error('Not connected to JIRA')
    const status = await this.connect(this.config)
    return status.connected
  }

  async fetchIssues(query: JiraQuery): Promise<JiraIssue[]> {
    if (!this.config) throw new Error('Not connected to JIRA')

    try {
      const response = await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...this.config, ...query }),
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

  transformToGanttTasks(issues: JiraIssue[]): GanttTask[] {
    return JiraTransformer.transformToGanttTasks(issues)
  }

  async updateIssue(issueKey: string, updates: Partial<JiraIssue>): Promise<void> {
    if (!this.config) throw new Error('Not connected to JIRA')

    try {
      const response = await fetch(`${API_BASE_URL}/update-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...this.config, issueKey, updates }),
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

  async getProjects(): Promise<Array<{ key: string; name: string }>> {
    if (!this.config) throw new Error('Not connected to JIRA')

    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  disconnect() {
    this.config = null
  }

  getConfig(): JiraConfig | null {
    return this.config
  }
}

export const jiraService = new JiraService()
