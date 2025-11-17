import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { CJMPage } from '@/pages/CJMPage'
import { BusinessCanvasPage } from '@/pages/BusinessCanvasPage'
import { LeanCanvasPage } from '@/pages/LeanCanvasPage'
import { RoadmapPage } from '@/pages/RoadmapPage'
import { GanttPage } from '@/pages/GanttPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import PromptsPage from '@/pages/PromptsPage'
import { TestSupabasePage } from '@/pages/TestSupabasePage'
import { PresentationPage } from '@/pages/PresentationPage'
import { DocumentationPage } from '@/pages/DocumentationPage'
import { Toaster } from '@/components/ui/toaster'

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="cjm" element={<CJMPage />} />
          <Route path="business-canvas" element={<BusinessCanvasPage />} />
          <Route path="lean-canvas" element={<LeanCanvasPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="gantt" element={<GanttPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="prompts" element={<PromptsPage />} />
          <Route path="ai-settings" element={<Navigate to="/settings" replace />} />
          <Route path="test-supabase" element={<TestSupabasePage />} />
          <Route path="presentation" element={<PresentationPage />} />
          <Route path="documentation" element={<DocumentationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
