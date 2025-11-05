import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { CJMPage } from '@/pages/CJMPage'
import { BusinessCanvasPage } from '@/pages/BusinessCanvasPage'
import { LeanCanvasPage } from '@/pages/LeanCanvasPage'
import { RoadmapPage } from '@/pages/RoadmapPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { TestSupabasePage } from '@/pages/TestSupabasePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="cjm" element={<CJMPage />} />
          <Route path="business-canvas" element={<BusinessCanvasPage />} />
          <Route path="lean-canvas" element={<LeanCanvasPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="ai-settings" element={<Navigate to="/settings" replace />} />
          <Route path="test-supabase" element={<TestSupabasePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
