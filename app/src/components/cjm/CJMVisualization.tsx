import { CJMStageCard } from './CJMStageCard'

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
