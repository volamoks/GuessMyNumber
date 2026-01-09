import { CanvasPageLayout } from '@/features/canvases/components/CanvasPageLayout'
import { CJMVisualization } from '../components/CJMVisualization'
import { AIGenerator } from '../components/AIGenerator'
import { EXAMPLE_CJM } from '@/data/examples/cjm'
import { generateCJM, analyzeCJM, improveCJM } from '@/lib/ai-operations'
import type { CJMData } from '@/lib/schemas'

export function CJMPage() {
  return (
    <CanvasPageLayout<CJMData>
      title="Customer Journey Map"
      description="Визуализируйте и анализируйте путь вашего клиента"
      projectType="cjm"
      exampleData={EXAMPLE_CJM}
      generateFn={generateCJM}
      analyzeFn={analyzeCJM}
      improveFn={improveCJM}
      VisualizationComponent={CJMVisualization}
      GeneratorComponent={AIGenerator}
      getTitle={(data) => data.title}
      getDescription={(data) => data.description}
    />
  )
}
