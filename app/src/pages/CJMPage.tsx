import { CanvasPageLayout } from '@/components/shared/CanvasPageLayout'
import { useCJMStore } from '@/store'
import { CJMVisualization } from '@/components/cjm/CJMVisualization'
import { AIGenerator } from '@/components/cjm/AIGenerator'
import { EXAMPLE_CJM } from '@/data/examples/cjm'
import * as aiService from '@/lib/ai-service'

interface CJMStage {
  name: string
  customerActivities: string[]
  customerGoals: string[]
  touchpoints: string[]
  experience: string[]
  positives: string[]
  negatives: string[]
  ideasOpportunities: string[]
  businessGoal: string
  kpis: string[]
  organizationalActivities: string[]
  responsibility: string[]
  technologySystems: string[]
}

interface CJMData {
  title: string
  persona: string
  description?: string
  stages: CJMStage[]
}

export function CJMPage() {
  const store = useCJMStore()

  return (
    <CanvasPageLayout<CJMData>
      title="Customer Journey Map"
      description="Визуализируйте и анализируйте путь вашего клиента"
      projectType="cjm"
      exampleData={EXAMPLE_CJM}

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
      isImproving={store.isImproving}
      setIsImproving={store.setImproving}
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
      generateFn={aiService.generateCJM}
      analyzeFn={aiService.analyzeCJM}
      improveFn={aiService.improveCJM}

      // Components
      VisualizationComponent={CJMVisualization}
      GeneratorComponent={AIGenerator}

      // Data accessors
      getTitle={(data) => data.title}
      getDescription={(data) => data.description}
    />
  )
}
