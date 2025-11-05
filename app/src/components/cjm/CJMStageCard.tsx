interface CJMStage {
  name: string
  touchpoints: string[]
  emotions: string[]
  painPoints: string[]
  opportunities: string[]
}

interface CJMStageCardProps {
  stage: CJMStage
}

export function CJMStageCard({ stage }: CJMStageCardProps) {
  return (
    <div className="flex-shrink-0 w-64 p-4 border rounded-lg bg-card shadow-sm">
      <h3 className="font-semibold mb-3 text-lg">{stage.name}</h3>

      <div className="space-y-3 text-sm">
        <div>
          <p className="font-medium text-muted-foreground mb-1">Точки контакта:</p>
          <ul className="list-disc list-inside space-y-1">
            {stage.touchpoints.map((tp, i) => (
              <li key={i}>{tp}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-muted-foreground mb-1">Эмоции:</p>
          <div className="flex flex-wrap gap-1">
            {stage.emotions.map((em, i) => (
              <span
                key={i}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs"
              >
                {em}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="font-medium text-muted-foreground mb-1">Pain Points:</p>
          <ul className="list-disc list-inside space-y-1 text-red-600 dark:text-red-400">
            {stage.painPoints.map((pp, i) => (
              <li key={i}>{pp}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-medium text-muted-foreground mb-1">Возможности:</p>
          <ul className="list-disc list-inside space-y-1 text-green-600 dark:text-green-400">
            {stage.opportunities.map((opp, i) => (
              <li key={i}>{opp}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
