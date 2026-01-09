// JIRA Connection Configuration
export interface JiraConfig {
  host: string // e.g., 'https://your-domain.atlassian.net'
  email: string
  apiToken: string
}

// JIRA Subtask (simplified)
export interface JiraSubtask {
  id: string
  key: string
  summary: string
  status: string
  issueType: string
}

// JIRA Issue (complete with all fields)
export interface JiraIssue {
  id: string
  key: string
  summary: string
  description?: string
  status: string
  assignee?: string | null
  reporter?: string | null
  priority?: string | null
  issueType: string
  dueDate?: string
  startDate?: string
  createdDate?: string
  updatedDate?: string
  estimatedHours?: number | null
  remainingHours?: number | null
  progress?: number // 0-100
  parentKey?: string
  labels?: string[]
  components?: string[]
  resolution?: string | null
  epic?: string | null
  sprint?: string | null
  subtasks?: JiraSubtask[]
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
    summary: string
    status: string
    assignee?: string | null
    reporter?: string | null
    priority?: string | null
    issueType: string
    description?: string
    labels?: string[]
    components?: string[]
    resolution?: string | null
    epic?: string | null
    sprint?: string | null
    createdDate?: string
    updatedDate?: string
    estimatedHours?: number | null
    remainingHours?: number | null
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
