import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2, Link2, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { useJiraConnection } from '@/hooks'

/**
 * Компонент подключения к JIRA (Presentational Component)
 * Вся логика вынесена в useJiraConnection hook
 */
export function JiraConnection() {
  const {
    isConnecting,
    error,
    connectionStatus,
    hasEnvConfig,
    envConfig,
    connect,
    autoConnect,
    disconnect,
  } = useJiraConnection()

  const [isCollapsed, setIsCollapsed] = useState(false)

  // Auto-connect при монтировании если есть .env
  useEffect(() => {
    autoConnect()
  }, [autoConnect])

  // Auto-collapse после успешного подключения
  useEffect(() => {
    if (connectionStatus.connected) {
      setIsCollapsed(true)
    }
  }, [connectionStatus.connected])

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            JIRA Connection
            {connectionStatus.connected && (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
          </div>
          {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </CardTitle>
        {!isCollapsed && (
          <CardDescription>
            Connect to your JIRA instance using credentials from .env.local
          </CardDescription>
        )}
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
        {connectionStatus.connected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Connected to {connectionStatus.host}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Email: {connectionStatus.email}</p>
              {connectionStatus.lastSync && (
                <p>Last sync: {new Date(connectionStatus.lastSync).toLocaleString()}</p>
              )}
            </div>
            <Button variant="outline" onClick={disconnect}>
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

                <Button onClick={() => connect()} disabled={isConnecting} className="w-full">
                  {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isConnecting ? 'Connecting...' : 'Connect to JIRA'}
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
      )}
    </Card>
  )
}
