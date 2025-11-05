import { CanvasBlock } from './CanvasBlock'

interface BusinessCanvasData {
  title: string
  keyPartners: string[]
  keyActivities: string[]
  keyResources: string[]
  valueProposition: string[]
  customerRelationships: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
}

interface CanvasVisualizationProps {
  data: BusinessCanvasData
}

export function CanvasVisualization({ data }: CanvasVisualizationProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Row 1 */}
      <CanvasBlock title="Ключевые партнёры" items={data.keyPartners} />
      <CanvasBlock title="Ключевые активности" items={data.keyActivities} />
      <CanvasBlock
        title="Ценностное предложение"
        items={data.valueProposition}
        className="lg:row-span-2 bg-primary/5"
      />
      <CanvasBlock title="Взаимоотношения" items={data.customerRelationships} />
      <CanvasBlock title="Сегменты клиентов" items={data.customerSegments} />

      {/* Row 2 */}
      <div className="md:col-start-1">
        <CanvasBlock title="Ключевые ресурсы" items={data.keyResources} />
      </div>
      <div className="md:col-start-2">
        <CanvasBlock title="Каналы" items={data.channels} />
      </div>

      {/* Row 3 - Full width */}
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
