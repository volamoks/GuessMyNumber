import { CanvasPageLayout } from '@/components/shared/CanvasPageLayout'
import { useLeanCanvasStore, type LeanCanvasData } from '@/store'
import { CanvasVisualization } from '@/components/lean-canvas/CanvasVisualization'
import { AIGenerator } from '@/components/cjm/AIGenerator'
import { EXAMPLE_LEAN_CANVAS } from '@/data/examples/lean-canvas'
import * as aiService from '@/lib/ai-service'

export function LeanCanvasPage() {
  const store = useLeanCanvasStore()

  return (
    <CanvasPageLayout<LeanCanvasData>
      title="Lean Canvas"
      description="Быстро спроектируйте бизнес-модель для стартапа"
      projectType="lean_canvas"
      exampleData={EXAMPLE_LEAN_CANVAS}

      // Store bindings
      data={store.data}
      setData={store.setData}
      analysis={store.analysis || null}
      setAnalysis={(analysis) => store.setAnalysis(analysis || '')}
      currentProjectId={store.currentProjectId}
      setCurrentProjectId={store.setCurrentProjectId}

      isGenerating={store.isGenerating}
      setIsGenerating={store.setGenerating}
      isAnalyzing={store.isAnalyzing}
      setIsAnalyzing={store.setAnalyzing}
      isSaving={store.isSaving}
      setIsSaving={store.setSaving}
      setIsExporting={store.setExporting}

      showGenerator={store.showGenerator}
      setShowGenerator={store.setShowGenerator}
      toggleGenerator={store.toggleGenerator}
      showVersions={store.showVersions}
      setShowVersions={store.setShowVersions}
      versions={store.versions}
      setVersions={store.setVersions}

      // AI functions
      generateFn={aiService.generateLeanCanvas}
      analyzeFn={aiService.analyzeLeanCanvas}

      // Components
      VisualizationComponent={CanvasVisualization}
      GeneratorComponent={AIGenerator}

      // Data accessors
      getTitle={(data) => data.title}
    />
  )
}
