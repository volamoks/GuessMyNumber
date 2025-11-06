// JIRA Connection Configuration
export interface JiraConfig {
  host: string // e.g., 'https://your-domain.atlassian.net'
  email: string
  apiToken: string
}

// JIRA Issue (simplified for Gantt)
export interface JiraIssue {
  id: string
  key: string
  summary: string
  description?: string
  status: string
  assignee?: string
  priority?: string
  issueType: string
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  progress?: number // 0-100
  parentKey?: string
  labels?: string[]
  epic?: string
}

// Gantt Task (transformed from JIRA)
export interface GanttTask {
  id: string
  text: string
  start_date: Date
  end_date: Date
  duration: number
  progress: number // 0-1
  parent?: string
  type?: 'task' | 'project' | 'milestone'
  open?: boolean
  details?: {
    key: string
    status: string
    assignee?: string
    priority?: string
    issueType: string
    description?: string
    labels?: string[]
  }
}

// JIRA Query Configuration
export interface JiraQuery {
  projectKey?: string
  jql?: string // Custom JQL query
  maxResults?: number
}

// Connection Status
export interface ConnectionStatus {
  connected: boolean
  host?: string
  email?: string
  lastSync?: Date
  error?: string
}
