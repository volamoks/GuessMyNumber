import { CJMStageCard } from './CJMStageCard'

interface CJMStage {
  name: string
  touchpoints: string[]
  emotions: string[]
  painPoints: string[]
  opportunities: string[]
}

interface CJMData {
  title: string
  persona: string
  stages: CJMStage[]
}

interface CJMVisualizationProps {
  data: CJMData
  visualizationId: string
}

export function CJMVisualization({ data, visualizationId }: CJMVisualizationProps) {
  return (
    <div id={visualizationId} className="overflow-x-auto bg-white p-4 rounded-lg">
      <div className="flex gap-4 pb-4 min-w-max">
        {data.stages.map((stage, index) => (
          <CJMStageCard key={index} stage={stage} />
        ))}
      </div>
    </div>
  )
}
