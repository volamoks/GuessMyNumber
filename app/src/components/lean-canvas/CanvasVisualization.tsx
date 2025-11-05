import { CanvasBlock } from './CanvasBlock'

interface LeanCanvasData {
  title: string
  problem: string[]
  solution: string[]
  keyMetrics: string[]
  uniqueValueProposition: string
  unfairAdvantage: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
}

interface CanvasVisualizationProps {
  data: LeanCanvasData
}

export function CanvasVisualization({ data }: CanvasVisualizationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Row 1 */}
      <CanvasBlock
        title="Проблема"
        items={data.problem}
        className="bg-red-50 dark:bg-red-950/20"
      />
      <div className="lg:col-span-2">
        <CanvasBlock
          title="Уникальное ценностное предложение"
          content={data.uniqueValueProposition}
          className="bg-primary/10 lg:row-span-2 h-full"
        />
      </div>
      <CanvasBlock
        title="Несправедливое преимущество"
        items={data.unfairAdvantage}
        className="bg-yellow-50 dark:bg-yellow-950/20"
      />
      <CanvasBlock title="Сегменты клиентов" items={data.customerSegments} />

      {/* Row 2 */}
      <CanvasBlock title="Решение" items={data.solution} />
      <CanvasBlock title="Каналы" items={data.channels} />

      {/* Row 3 */}
      <CanvasBlock title="Ключевые метрики" items={data.keyMetrics} />

      {/* Row 4 - Full width */}
      <div className="lg:col-span-2">
        <CanvasBlock
          title="Структура издержек"
          items={data.costStructure}
          className="bg-red-50 dark:bg-red-950/20"
        />
      </div>
      <div className="lg:col-span-3">
        <CanvasBlock
          title="Потоки доходов"
          items={data.revenueStreams}
          className="bg-green-50 dark:bg-green-950/20"
        />
      </div>
    </div>
  )
}
