import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { CJMPage } from '@/features/cjm/pages/CJMPage'
import { BusinessCanvasPage } from '@/features/canvases/pages/BusinessCanvasPage'
import { LeanCanvasPage } from '@/features/canvases/pages/LeanCanvasPage'
import { RoadmapPage } from '@/features/roadmap/pages/RoadmapPage'
import { GanttPage } from '@/features/jira-gantt/pages/GanttPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProjectsPage } from '@/features/projects/pages/ProjectsPage'
import PromptsPage from '@/features/ai/pages/PromptsPage'
import { TestSupabasePage } from '@/pages/TestSupabasePage'
import { PresentationPage } from '@/features/presentation/pages/PresentationPage'
import { TranscriptionPage } from '@/features/transcription/pages/TranscriptionPage'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider, useAuth } from '@/features/auth/AuthContext'
import { AuthPage } from '@/features/auth/pages/AuthPage'
import { ROUTES } from '@/constants/routes'
import { Loader2 } from 'lucide-react'

// Private Route Component
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path={ROUTES.LOGIN} element={<AuthPage />} />
          {/* Public/Shared Presentation Route - No Sidebar, No Auth required for guests */}
          <Route path="/presentation/:id" element={<PresentationPage />} />

          <Route path={ROUTES.HOME} element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to={ROUTES.PROJECTS} replace />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="cjm" element={<CJMPage />} />
            <Route path="business-canvas" element={<BusinessCanvasPage />} />
            <Route path="lean-canvas" element={<LeanCanvasPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="gantt" element={<GanttPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="prompts" element={<PromptsPage />} />
            <Route path="ai-settings" element={<Navigate to={ROUTES.SETTINGS} replace />} />
            <Route path="test-supabase" element={<TestSupabasePage />} />
            <Route path="presentation" element={<PresentationPage />} />
            <Route path="transcription" element={<TranscriptionPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
