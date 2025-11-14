import { CanvasPageLayout } from '@/components/shared/CanvasPageLayout'
import { RoadmapVisualization } from '@/components/roadmap/RoadmapVisualization'
import { AIGenerator } from '@/components/cjm/AIGenerator'
import { EXAMPLE_ROADMAP } from '@/data/examples/roadmap'
import { generateRoadmap, analyzeRoadmap, improveRoadmap } from '@/lib/ai-operations'
import type { RoadmapData } from '@/lib/schemas'

export function RoadmapPage() {
  return (
    <CanvasPageLayout<RoadmapData>
      title="Product Roadmap"
      description="Визуализация продуктовой стратегии в формате Now-Next-Later"
      projectType="roadmap"
      exampleData={EXAMPLE_ROADMAP}
      generateFn={generateRoadmap}
      analyzeFn={analyzeRoadmap}
      improveFn={improveRoadmap}
      VisualizationComponent={RoadmapVisualization}
      GeneratorComponent={AIGenerator}
      getTitle={(data) => data.title}
      getDescription={(data) => data.description}
    />
  )
}
