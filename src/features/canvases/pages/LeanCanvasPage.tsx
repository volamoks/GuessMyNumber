import { CanvasPageLayout } from '@/features/canvases/components/CanvasPageLayout'
import { CanvasVisualization } from '@/features/canvases/components/lean-canvas/CanvasVisualization'
import { AIGenerator } from '@/features/cjm/components/AIGenerator'
import { EXAMPLE_LEAN_CANVAS } from '@/data/examples/lean-canvas'
import { generateLeanCanvas, analyzeLeanCanvas, improveLeanCanvas } from '@/lib/ai-operations'
import type { LeanCanvasData } from '@/lib/schemas'

export function LeanCanvasPage() {
  return (
    <CanvasPageLayout<LeanCanvasData>
      title="Lean Canvas"
      description="Быстро спроектируйте бизнес-модель для стартапа"
      projectType="lean_canvas"
      exampleData={EXAMPLE_LEAN_CANVAS}
      generateFn={generateLeanCanvas}
      analyzeFn={analyzeLeanCanvas}
      improveFn={improveLeanCanvas}
      VisualizationComponent={CanvasVisualization}
      GeneratorComponent={AIGenerator}
      getTitle={(data) => data.title}
    />
  )
}
