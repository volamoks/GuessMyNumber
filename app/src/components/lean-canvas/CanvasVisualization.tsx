import { AlertTriangle, Lightbulb, TrendingUp, Trophy, Radio, Users, DollarSign, TrendingDown, BarChart3 } from 'lucide-react'
import { EditableList } from '@/components/shared/EditableList'
import { EditableText } from '@/components/shared/EditableText'

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
  visualizationId: string
  onUpdate: (data: LeanCanvasData) => void
}

interface ListBlockProps {
  title: string
  items: string[]
  onItemsChange: (newItems: string[]) => void
  icon: React.ReactNode
  color: string
  className?: string
}

interface TextBlockProps {
  title: string
  text: string
  onTextChange: (newText: string) => void
  icon: React.ReactNode
  color: string
  className?: string
}

function ListBlock({ title, items, onItemsChange, icon, color, className = '' }: ListBlockProps) {
  return (
    <div className={`border-2 rounded-lg p-4 h-full min-h-[180px] transition-all hover:shadow-lg ${color} ${className}`}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-current/20">
        {icon}
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <EditableList items={items} onChange={onItemsChange} placeholder="Добавить..." />
    </div>
  )
}

function TextBlock({ title, text, onTextChange, icon, color, className = '' }: TextBlockProps) {
  return (
    <div className={`border-2 rounded-lg p-4 h-full min-h-[180px] transition-all hover:shadow-lg ${color} ${className}`}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-current/20">
        {icon}
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <EditableText text={text} onChange={onTextChange} placeholder="Введите уникальное ценностное предложение..." />
    </div>
  )
}

export function CanvasVisualization({ data, visualizationId, onUpdate }: CanvasVisualizationProps) {
  const handleUpdateList = (field: keyof LeanCanvasData, newItems: string[]) => {
    onUpdate({ ...data, [field]: newItems })
  }

  const handleUpdateText = (field: keyof LeanCanvasData, newText: string) => {
    onUpdate({ ...data, [field]: newText })
  }

  return (
    <div id={visualizationId} className="space-y-4">
      {/* Classic Lean Canvas Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 auto-rows-fr">
        {/* Row 1 - Problem */}
        <div className="lg:row-span-1">
          <ListBlock
            title="Problem"
            items={data.problem}
            onItemsChange={(items) => handleUpdateList('problem', items)}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="border-issue-bug/30 bg-issue-bug/10 text-foreground"
          />
        </div>

        {/* Row 1-2 - Unique Value Proposition (center, spans 2 rows) */}
        <div className="lg:col-span-2 lg:row-span-2">
          <TextBlock
            title="Unique Value Proposition"
            text={data.uniqueValueProposition}
            onTextChange={(text) => handleUpdateText('uniqueValueProposition', text)}
            icon={<Trophy className="h-5 w-5" />}
            color="border-warning/50 bg-gradient-to-br from-warning/20 to-warning/10 text-foreground shadow-md"
            className="border-4"
          />
        </div>

        {/* Row 1 - Solution */}
        <div className="lg:row-span-1">
          <ListBlock
            title="Solution"
            items={data.solution}
            onItemsChange={(items) => handleUpdateList('solution', items)}
            icon={<Lightbulb className="h-5 w-5" />}
            color="border-warning/30 bg-warning/10 text-foreground"
          />
        </div>

        {/* Row 1 - Customer Segments */}
        <div className="lg:row-span-1">
          <ListBlock
            title="Customer Segments"
            items={data.customerSegments}
            onItemsChange={(items) => handleUpdateList('customerSegments', items)}
            icon={<Users className="h-5 w-5" />}
            color="border-success/30 bg-success/10 text-foreground"
          />
        </div>

        {/* Row 2 - Key Metrics */}
        <div className="lg:row-span-1">
          <ListBlock
            title="Key Metrics"
            items={data.keyMetrics}
            onItemsChange={(items) => handleUpdateList('keyMetrics', items)}
            icon={<BarChart3 className="h-5 w-5" />}
            color="border-issue-story/30 bg-issue-story/10 text-foreground"
          />
        </div>

        {/* Row 2 - Unfair Advantage */}
        <div className="lg:row-span-1">
          <ListBlock
            title="Unfair Advantage"
            items={data.unfairAdvantage}
            onItemsChange={(items) => handleUpdateList('unfairAdvantage', items)}
            icon={<TrendingUp className="h-5 w-5" />}
            color="border-issue-epic/30 bg-issue-epic/10 text-foreground"
          />
        </div>

        {/* Row 2 - Channels */}
        <div className="lg:row-span-1">
          <ListBlock
            title="Channels"
            items={data.channels}
            onItemsChange={(items) => handleUpdateList('channels', items)}
            icon={<Radio className="h-5 w-5" />}
            color="border-issue-task/30 bg-issue-task/10 text-foreground"
          />
        </div>
      </div>

      {/* Bottom Row - Cost Structure & Revenue Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <ListBlock
            title="Cost Structure"
            items={data.costStructure}
            onItemsChange={(items) => handleUpdateList('costStructure', items)}
            icon={<TrendingDown className="h-5 w-5" />}
            color="border-issue-bug/50 bg-gradient-to-br from-issue-bug/20 to-issue-bug/10 text-foreground shadow-sm"
          />
        </div>
        <div className="lg:col-span-3">
          <ListBlock
            title="Revenue Streams"
            items={data.revenueStreams}
            onItemsChange={(items) => handleUpdateList('revenueStreams', items)}
            icon={<DollarSign className="h-5 w-5" />}
            color="border-success/50 bg-gradient-to-br from-success/20 to-success/10 text-foreground shadow-sm"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="text-center text-xs text-muted-foreground pt-2 border-t">
        <p className="font-medium">Lean Canvas Template</p>
        <p>leanstack.com | Adapted from The Business Model Canvas by Strategyzer</p>
      </div>
    </div>
  )
}
