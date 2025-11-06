import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2, Link2, Info } from 'lucide-react'
import { jiraService } from '@/lib/jira-service'
import { useGanttStore } from '@/store'
import type { JiraConfig } from '@/lib/jira-types'

export function JiraConnection() {
  const store = useGanttStore()
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')
  const hasAttemptedConnect = useRef(false)

  // Load credentials from environment variables
  const envConfig: JiraConfig = {
    host: import.meta.env.VITE_JIRA_HOST || '',
    email: import.meta.env.VITE_JIRA_EMAIL || '',
    apiToken: import.meta.env.VITE_JIRA_API_TOKEN || '',
  }

  const hasEnvConfig = envConfig.host && envConfig.email && envConfig.apiToken

  // Auto-connect on mount if env variables are set
  useEffect(() => {
    if (hasEnvConfig && !store.connectionStatus.connected && !hasAttemptedConnect.current) {
      hasAttemptedConnect.current = true
      handleConnect()
    }
  }, [hasEnvConfig, store.connectionStatus.connected])

  const handleConnect = async () => {
    if (!hasEnvConfig) {
      setError('JIRA credentials not found in environment variables. Please set up .env.local')
      return
    }

    setError('')
    setTesting(true)

    try {
      const status = await jiraService.connect(envConfig)

      if (!status.connected) {
        setError(status.error || 'Failed to connect')
        store.setConnectionStatus({ connected: false, error: status.error })
      } else {
        store.setJiraConfig(envConfig)
        store.setConnectionStatus({
          connected: true,
          host: envConfig.host,
          email: envConfig.email,
          lastSync: new Date(),
        })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      store.setConnectionStatus({ connected: false, error: message })
    } finally {
      setTesting(false)
    }
  }

  const handleDisconnect = () => {
    jiraService.disconnect()
    store.setJiraConfig(null)
    store.setConnectionStatus({ connected: false })
    store.setSelectedProjectKey(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          JIRA Connection
        </CardTitle>
        <CardDescription>
          Connect to your JIRA instance using credentials from .env.local
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {store.connectionStatus.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Connected to {store.connectionStatus.host}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Email: {store.connectionStatus.email}</p>
              {store.connectionStatus.lastSync && (
                <p>Last sync: {new Date(store.connectionStatus.lastSync).toLocaleString()}</p>
              )}
            </div>
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {hasEnvConfig ? (
              <>
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <Info className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Credentials loaded from .env.local</p>
                    <p className="text-xs mt-1">Host: {envConfig.host}</p>
                    <p className="text-xs">Email: {envConfig.email}</p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button onClick={handleConnect} disabled={testing} className="w-full">
                  {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {testing ? 'Connecting...' : 'Connect to JIRA'}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                  <AlertCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium mb-2">JIRA credentials not configured</p>
                    <p className="text-xs">Follow these steps to set up:</p>
                  </div>
                </div>

                <div className="text-sm space-y-2 bg-muted p-4 rounded-lg">
                  <p className="font-medium">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-2 text-xs">
                    <li>Copy <code className="bg-background px-1 py-0.5 rounded">.env.example</code> to <code className="bg-background px-1 py-0.5 rounded">.env.local</code></li>
                    <li>Edit <code className="bg-background px-1 py-0.5 rounded">.env.local</code> and add your JIRA credentials:</li>
                  </ol>
                  <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
{`VITE_JIRA_HOST=https://your-domain.atlassian.net
VITE_JIRA_EMAIL=your-email@example.com
VITE_JIRA_API_TOKEN=your_api_token`}
                  </pre>
                  <p className="text-xs mt-2">
                    <a
                      href="https://id.atlassian.com/manage-profile/security/api-tokens"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-primary"
                    >
                      Generate API token here →
                    </a>
                  </p>
                  <li className="text-xs mt-2">Restart the dev server: <code className="bg-background px-1 py-0.5 rounded">npm run dev</code></li>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
