import { CanvasPageLayout } from '@/components/shared/CanvasPageLayout'
import { useRoadmapStore, type RoadmapData } from '@/store'
import { RoadmapVisualization } from '@/components/roadmap/RoadmapVisualization'
import { AIGenerator } from '@/components/cjm/AIGenerator'
import { EXAMPLE_ROADMAP } from '@/data/examples/roadmap'
import * as aiService from '@/lib/ai-service'

export function RoadmapPage() {
  const store = useRoadmapStore()

  return (
    <CanvasPageLayout<RoadmapData>
      title="Product Roadmap"
      description="Визуализация продуктовой стратегии в формате Now-Next-Later"
      projectType="roadmap"
      exampleData={EXAMPLE_ROADMAP}

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
      generateFn={aiService.generateRoadmap}
      analyzeFn={aiService.analyzeRoadmap}
      improveFn={aiService.improveRoadmap}

      // Components
      VisualizationComponent={RoadmapVisualization}
      GeneratorComponent={AIGenerator}

      // Data accessors
      getTitle={(data) => data.title}
      getDescription={(data) => data.description}
    />
  )
}
