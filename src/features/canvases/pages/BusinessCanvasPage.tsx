import { CanvasPageLayout } from '@/features/canvases/components/CanvasPageLayout'
import { CanvasVisualization } from '@/features/canvases/components/business-canvas/CanvasVisualization'
import { AIGenerator } from '@/features/cjm/components/AIGenerator'
import { EXAMPLE_BUSINESS_CANVAS } from '@/data/examples/business-canvas'
import { generateBusinessCanvas, analyzeBusinessCanvas, improveBusinessCanvas } from '@/lib/ai-operations'
import type { BusinessCanvasData } from '@/lib/schemas'

export function BusinessCanvasPage() {
  return (
    <CanvasPageLayout<BusinessCanvasData>
      title="Business Model Canvas"
      description="Создайте и проанализируйте бизнес-модель по методу A. Osterwalder"
      projectType="business_canvas"
      exampleData={EXAMPLE_BUSINESS_CANVAS}
      generateFn={generateBusinessCanvas}
      analyzeFn={analyzeBusinessCanvas}
      improveFn={improveBusinessCanvas}
      VisualizationComponent={CanvasVisualization}
      GeneratorComponent={AIGenerator}
      getTitle={(data) => data.title}
    />
  )
}
