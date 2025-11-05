import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { CJMPage } from '@/pages/CJMPage'
import { BusinessCanvasPage } from '@/pages/BusinessCanvasPage'
import { LeanCanvasPage } from '@/pages/LeanCanvasPage'
import { AISettingsPage } from '@/pages/AISettingsPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/cjm" replace />} />
          <Route path="cjm" element={<CJMPage />} />
          <Route path="business-canvas" element={<BusinessCanvasPage />} />
          <Route path="lean-canvas" element={<LeanCanvasPage />} />
          <Route path="ai-settings" element={<AISettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
