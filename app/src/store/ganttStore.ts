import { create } from 'zustand'
import type { GanttTask, JiraConfig, ConnectionStatus, JiraQuery } from '@/lib/jira-types'
import type { GanttColumn } from '@/components/gantt/GanttColumnManager'
import type { TaskTypeColor } from '@/components/gantt/ColorCustomizer'

export interface GanttData {
  title: string
  description: string
  tasks: GanttTask[]
  lastSync?: Date
}

export interface GanttFilters {
  issueTypes?: string[]      // Epic, Story, Task, Bug, Sub-task
  statuses?: string[]         // To Do, In Progress, Done
  priorities?: string[]       // Highest, High, Medium, Low, Lowest
  assignees?: string[]        // User emails
  dateRange?: {
    start?: Date
    end?: Date
  }
}

export const DEFAULT_COLUMNS: GanttColumn[] = [
  { id: 'text', name: 'text', label: 'Task', width: 250, visible: true, resize: true, align: 'left' },
  { id: 'start_date', name: 'start_date', label: 'Start Date', width: 90, visible: true, resize: true, align: 'center' },
  { id: 'duration', name: 'duration', label: 'Duration', width: 70, visible: true, resize: true, align: 'center' },
]

export const DEFAULT_COLORS: TaskTypeColor[] = [
  { type: 'Epic', color: '#9333ea', label: 'Epic' },
  { type: 'Story', color: '#3b82f6', label: 'Story' },
  { type: 'Task', color: '#10b981', label: 'Task' },
  { type: 'Bug', color: '#ef4444', label: 'Bug' },
  { type: 'Sub-task', color: '#6366f1', label: 'Sub-task' },
]

interface GanttStore {
  data: GanttData | null
  currentProjectId: string | null

  // JIRA connection
  connectionStatus: ConnectionStatus
  jiraConfig: JiraConfig | null
  selectedProjectKey: string | null
  selectedProjectKeys: string[]   // Multiple projects for portfolio analysis
  jiraQuery: JiraQuery | null
  filters: GanttFilters

  // Customization
  columns: GanttColumn[]
  customColors: TaskTypeColor[]

  // Loading states
  isConnecting: boolean
  isSyncing: boolean
  isLoading: boolean
  isSaving: boolean
  isExporting: boolean

  // UI states
  showConnectionDialog: boolean
  showSettings: boolean
  showVersions: boolean
  versions: any[]

  // Actions
  setData: (data: GanttData | null) => void
  setCurrentProjectId: (id: string | null) => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setJiraConfig: (config: JiraConfig | null) => void
  setSelectedProjectKey: (key: string | null) => void
  setSelectedProjectKeys: (keys: string[]) => void
  addProjectKey: (key: string) => void
  removeProjectKey: (key: string) => void
  setJiraQuery: (query: JiraQuery | null) => void
  setFilters: (filters: GanttFilters) => void
  clearFilters: () => void
  setColumns: (columns: GanttColumn[]) => void
  setCustomColors: (colors: TaskTypeColor[]) => void

  setConnecting: (loading: boolean) => void
  setSyncing: (loading: boolean) => void
  setLoading: (loading: boolean) => void
  setSaving: (loading: boolean) => void
  setExporting: (loading: boolean) => void

  setShowConnectionDialog: (show: boolean) => void
  setShowSettings: (show: boolean) => void
  setShowVersions: (show: boolean) => void
  toggleConnectionDialog: () => void
  toggleSettings: () => void
  toggleVersions: () => void
  setVersions: (versions: any[]) => void

  reset: () => void
}

const initialState = {
  data: null,
  currentProjectId: null,
  connectionStatus: { connected: false },
  jiraConfig: null,
  selectedProjectKey: null,
  selectedProjectKeys: [],
  jiraQuery: null,
  filters: {},
  columns: DEFAULT_COLUMNS,
  customColors: DEFAULT_COLORS,
  isConnecting: false,
  isSyncing: false,
  isLoading: false,
  isSaving: false,
  isExporting: false,
  showConnectionDialog: false,
  showSettings: false,
  showVersions: false,
  versions: [],
}

export const useGanttStore = create<GanttStore>((set) => ({
  ...initialState,

  setData: (data) => set({ data }),
  setCurrentProjectId: (currentProjectId) => set({ currentProjectId }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setJiraConfig: (jiraConfig) => set({ jiraConfig }),
  setSelectedProjectKey: (selectedProjectKey) => set({ selectedProjectKey }),
  setSelectedProjectKeys: (selectedProjectKeys) => set({ selectedProjectKeys }),
  addProjectKey: (key) => set((state) => ({
    selectedProjectKeys: [...state.selectedProjectKeys, key]
  })),
  removeProjectKey: (key) => set((state) => ({
    selectedProjectKeys: state.selectedProjectKeys.filter(k => k !== key)
  })),
  setJiraQuery: (jiraQuery) => set({ jiraQuery }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  setColumns: (columns) => set({ columns }),
  setCustomColors: (customColors) => set({ customColors }),

  setConnecting: (isConnecting) => set({ isConnecting }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLoading: (isLoading) => set({ isLoading }),
  setSaving: (isSaving) => set({ isSaving }),
  setExporting: (isExporting) => set({ isExporting }),

  setShowConnectionDialog: (showConnectionDialog) => set({ showConnectionDialog }),
  setShowSettings: (showSettings) => set({ showSettings }),
  setShowVersions: (showVersions) => set({ showVersions }),
  toggleConnectionDialog: () => set((state) => ({ showConnectionDialog: !state.showConnectionDialog })),
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),
  toggleVersions: () => set((state) => ({ showVersions: !state.showVersions })),
  setVersions: (versions) => set({ versions }),

  reset: () => set(initialState),
}))
