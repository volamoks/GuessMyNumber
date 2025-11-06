import { create } from 'zustand'
import type { GanttTask, JiraConfig, ConnectionStatus, JiraQuery } from '@/lib/jira-types'

export interface GanttData {
  title: string
  description: string
  tasks: GanttTask[]
  lastSync?: Date
}

interface GanttStore {
  data: GanttData | null
  currentProjectId: string | null

  // JIRA connection
  connectionStatus: ConnectionStatus
  jiraConfig: JiraConfig | null
  selectedProjectKey: string | null
  jiraQuery: JiraQuery | null

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
  setJiraQuery: (query: JiraQuery | null) => void

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
  jiraQuery: null,
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
  setJiraQuery: (jiraQuery) => set({ jiraQuery }),

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
