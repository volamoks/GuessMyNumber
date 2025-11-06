import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2, Link2 } from 'lucide-react'
import { jiraService } from '@/lib/jira-service'
import { useGanttStore } from '@/store'
import type { JiraConfig } from '@/lib/jira-types'

export function JiraConnection() {
  const store = useGanttStore()
  const [formData, setFormData] = useState<JiraConfig>({
    host: store.jiraConfig?.host || '',
    email: store.jiraConfig?.email || '',
    apiToken: store.jiraConfig?.apiToken || '',
  })
  const [testing, setTesting] = useState(false)
  const [error, setError] = useState('')

  const handleConnect = async () => {
    setError('')
    setTesting(true)

    try {
      // Connect to JIRA
      const status = jiraService.connect(formData)

      if (!status.connected) {
        setError(status.error || 'Failed to connect')
        setTesting(false)
        return
      }

      // Test connection
      const isConnected = await jiraService.testConnection()

      if (isConnected) {
        store.setJiraConfig(formData)
        store.setConnectionStatus({
          connected: true,
          host: formData.host,
          email: formData.email,
          lastSync: new Date(),
        })
      } else {
        setError('Connection test failed. Please check your credentials.')
        store.setConnectionStatus({ connected: false, error: 'Connection test failed' })
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
          Connect to your JIRA instance to import and sync tasks
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
            <div className="space-y-2">
              <Label htmlFor="host">JIRA Host</Label>
              <Input
                id="host"
                placeholder="https://your-domain.atlassian.net"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiToken">API Token</Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Your JIRA API token"
                value={formData.apiToken}
                onChange={(e) => setFormData({ ...formData, apiToken: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Generate an API token from{' '}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Atlassian Account Settings
                </a>
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleConnect}
              disabled={testing || !formData.host || !formData.email || !formData.apiToken}
              className="w-full"
            >
              {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {testing ? 'Connecting...' : 'Connect to JIRA'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
