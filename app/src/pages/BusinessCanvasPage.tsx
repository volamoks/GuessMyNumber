import { CanvasPageLayout } from '@/components/shared/CanvasPageLayout'
import { useBusinessCanvasStore, type BusinessCanvasData } from '@/store'
import { CanvasVisualization } from '@/components/business-canvas/CanvasVisualization'
import { AIGenerator } from '@/components/cjm/AIGenerator'
import { EXAMPLE_BUSINESS_CANVAS } from '@/data/examples/business-canvas'
import * as aiService from '@/lib/ai-service'

export function BusinessCanvasPage() {
  const store = useBusinessCanvasStore()

  return (
    <CanvasPageLayout<BusinessCanvasData>
      title="Business Model Canvas"
      description="Создайте и проанализируйте бизнес-модель по методу A. Osterwalder"
      projectType="business_canvas"
      exampleData={EXAMPLE_BUSINESS_CANVAS}

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
      generateFn={aiService.generateBusinessCanvas}
      analyzeFn={aiService.analyzeBusinessCanvas}

      // Components
      VisualizationComponent={CanvasVisualization}
      GeneratorComponent={AIGenerator}

      // Data accessors
      getTitle={(data) => data.title}
    />
  )
}
