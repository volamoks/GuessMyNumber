import { useState, useCallback, useRef } from 'react'
import { useGanttStore } from '@/store'
import { jiraService } from '@/features/jira-gantt/services/jira-service'
import type { JiraConfig } from '@/features/jira-gantt/types'

/**
 * Custom hook для управления подключением к JIRA
 * Инкапсулирует всю логику подключения/отключения
 */
export function useJiraConnection() {
  const store = useGanttStore()
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string>('')
  const hasAttemptedAutoConnect = useRef(false)

  // Загрузка credentials из .env
  const envConfig: JiraConfig = {
    host: import.meta.env.VITE_JIRA_HOST || '',
    email: import.meta.env.VITE_JIRA_EMAIL || '',
    apiToken: import.meta.env.VITE_JIRA_API_TOKEN || '',
  }

  const hasEnvConfig = Boolean(envConfig.host && envConfig.email && envConfig.apiToken)

  /**
   * Подключение к JIRA
   */
  const connect = useCallback(async (config?: JiraConfig) => {
    const configToUse = config || envConfig

    if (!configToUse.host || !configToUse.email || !configToUse.apiToken) {
      setError('JIRA credentials not found. Please set up .env.local')
      return false
    }

    setError('')
    setIsConnecting(true)

    try {
      const status = await jiraService.connect(configToUse)

      if (!status.connected) {
        setError(status.error || 'Failed to connect')
        store.setConnectionStatus({ connected: false, error: status.error })
        return false
      }

      store.setJiraConfig(configToUse)
      store.setConnectionStatus({
        connected: true,
        host: configToUse.host,
        email: configToUse.email,
        lastSync: new Date(),
      })

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      store.setConnectionStatus({ connected: false, error: message })
      return false
    } finally {
      setIsConnecting(false)
    }
  }, [envConfig, store])

  /**
   * Автоматическое подключение при наличии .env переменных
   */
  const autoConnect = useCallback(async () => {
    if (hasEnvConfig && !store.connectionStatus.connected && !hasAttemptedAutoConnect.current) {
      hasAttemptedAutoConnect.current = true
      await connect()
    }
  }, [hasEnvConfig, store.connectionStatus.connected, connect])

  /**
   * Отключение от JIRA
   */
  const disconnect = useCallback(() => {
    jiraService.disconnect()
    store.setJiraConfig(null)
    store.setConnectionStatus({ connected: false })
    store.setSelectedProjectKey(null)
    store.setData(null)
    setError('')
  }, [store])

  return {
    // State
    isConnecting,
    error,
    connectionStatus: store.connectionStatus,
    hasEnvConfig,
    envConfig,

    // Actions
    connect,
    autoConnect,
    disconnect,
  }
}
