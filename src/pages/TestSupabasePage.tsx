import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { projectsService } from '@/lib/projects-service'
import { CheckCircle2, XCircle, Loader2, Database } from 'lucide-react'

export function TestSupabasePage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const testConnection = async () => {
    setConnectionStatus('testing')
    setConnectionMessage('Testing connection...')

    try {
      // Простой запрос для проверки connection
      const { error } = await supabase.from('projects').select('count')

      if (error) {
        throw error
      }

      setConnectionStatus('success')
      setConnectionMessage(`✅ Connection successful! Database is ready.`)
    } catch (error: any) {
      setConnectionStatus('error')
      setConnectionMessage(`❌ Error: ${error.message}`)

      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        setConnectionMessage(
          `❌ Tables not found! Please run the SQL schema first.\n\nGo to Supabase Dashboard → SQL Editor → Run supabase-schema.sql`
        )
      }
    }
  }

  const createTestProject = async () => {
    setIsLoading(true)
    try {
      const testData = {
        title: 'Test Project',
        persona: 'Test User',
        stages: [
          {
            name: 'Test Stage',
            customerActivities: ['Activity 1'],
            customerGoals: ['Goal 1'],
            touchpoints: ['Touchpoint 1'],
            experience: ['Happy'],
            positives: ['Good'],
            negatives: ['Bad'],
            ideasOpportunities: ['Idea 1'],
            businessGoal: 'Test Goal',
            kpis: ['KPI 1'],
            organizationalActivities: ['Org Activity'],
            responsibility: ['Team'],
            technologySystems: ['System 1'],
          },
        ],
      }

      const project = await projectsService.createProject(
        'Test CJM Project - ' + new Date().toISOString(),
        'cjm',
        testData,
        'Test project created from test page'
      )

      if (project) {
        alert('✅ Test project created successfully!')
        await loadProjects()
      } else {
        alert('❌ Failed to create project')
      }
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const data = await projectsService.getProjects()
      setProjects(data)
      alert(`✅ Loaded ${data.length} projects`)
    } catch (error: any) {
      alert('❌ Error loading projects: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAllProjects = async () => {
    if (!confirm('Delete ALL projects? This cannot be undone!')) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from('projects').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) throw error

      alert('✅ All projects deleted')
      setProjects([])
    } catch (error: any) {
      alert('❌ Error: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Supabase Connection Test
        </h1>
        <p className="text-muted-foreground mt-2">
          Test your Supabase database connection and CRUD operations
        </p>
      </div>

      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Connection Test
          </CardTitle>
          <CardDescription>
            First, test if the database is configured correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection} disabled={connectionStatus === 'testing'}>
            {connectionStatus === 'testing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>

          {connectionStatus !== 'idle' && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                connectionStatus === 'success'
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900'
                  : connectionStatus === 'error'
                  ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
                  : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900'
              }`}
            >
              {connectionStatus === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : connectionStatus === 'error' ? (
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0 mt-0.5" />
              )}
              <pre className="text-sm whitespace-pre-wrap flex-1">{connectionMessage}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CRUD Operations */}
      {connectionStatus === 'success' && (
        <Card>
          <CardHeader>
            <CardTitle>CRUD Operations Test</CardTitle>
            <CardDescription>Test create, read, update, delete operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={createTestProject} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Working...
                  </>
                ) : (
                  'Create Test Project'
                )}
              </Button>

              <Button onClick={loadProjects} disabled={isLoading} variant="secondary">
                Load Projects ({projects.length})
              </Button>

              <Button onClick={deleteAllProjects} disabled={isLoading} variant="destructive">
                Delete All Projects
              </Button>
            </div>

            {projects.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Projects in Database:</h3>
                <div className="space-y-2">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-3 border rounded-lg bg-muted/50 text-sm"
                    >
                      <div className="font-medium">{project.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Type: {project.type} | Created: {new Date(project.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>Step 1:</strong> Apply SQL Schema
            <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
              <li>Open Supabase Dashboard</li>
              <li>Go to SQL Editor</li>
              <li>Copy content from <code>supabase-schema.sql</code></li>
              <li>Paste and RUN</li>
            </ul>
          </div>

          <div>
            <strong>Step 2:</strong> Test Connection
            <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
              <li>Click "Test Connection" button above</li>
              <li>If successful, you can proceed</li>
            </ul>
          </div>

          <div>
            <strong>Step 3:</strong> Test CRUD
            <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
              <li>Create test project</li>
              <li>Load projects to see them</li>
              <li>Delete when done testing</li>
            </ul>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
            <strong>Environment:</strong>
            <pre className="text-xs mt-1 text-muted-foreground">
              VITE_SUPABASE_URL={import.meta.env.VITE_SUPABASE_URL || '❌ Not set'}
              {'\n'}
              VITE_SUPABASE_ANON_KEY={import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
