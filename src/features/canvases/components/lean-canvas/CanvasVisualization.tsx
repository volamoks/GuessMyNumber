import { AlertTriangle, Lightbulb, TrendingUp, Trophy, Radio, Users, DollarSign, TrendingDown, BarChart3 } from 'lucide-react'
import { GenericCanvasBlock } from '@/components/shared/GenericCanvasBlock'

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

export function CanvasVisualization({ data, visualizationId, onUpdate }: CanvasVisualizationProps) {
  const handleUpdateList = (field: keyof LeanCanvasData, newItems: string[]) => {
    onUpdate({ ...data, [field]: newItems })
  }

  const handleUpdateText = (field: keyof LeanCanvasData, newText: string) => {
    onUpdate({ ...data, [field]: newText })
  }

  return (
    <div id={visualizationId} className="space-y-6">
      {/* Classic Lean Canvas Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 auto-rows-fr">
        {/* Row 1 - Problem */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Problem"
            items={data.problem}
            onItemsChange={(items) => handleUpdateList('problem', items)}
            icon={<AlertTriangle />}
            accentColor="border-red-500" // Red for Problem (High Priority)
            variant="lean"
          />
        </div>

        {/* Row 1-2 - Unique Value Proposition (center, spans 2 rows) */}
        <div className="lg:col-span-2 lg:row-span-2">
          <GenericCanvasBlock
            title="Unique Value Proposition"
            text={data.uniqueValueProposition}
            onTextChange={(text) => handleUpdateText('uniqueValueProposition', text)}
            icon={<Trophy />}
            accentColor="border-amber-500" // Gold/Amber for Value
            className="bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/10"
            placeholder="Enter your value proposition..."
            variant="lean"
          />
        </div>

        {/* Row 1 - Solution */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Solution"
            items={data.solution}
            onItemsChange={(items) => handleUpdateList('solution', items)}
            icon={<Lightbulb />}
            accentColor="border-green-500" // Green for Solution
            variant="lean"
          />
        </div>

        {/* Row 1 - Customer Segments */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Customer Segments"
            items={data.customerSegments}
            onItemsChange={(items) => handleUpdateList('customerSegments', items)}
            icon={<Users />}
            accentColor="border-blue-500" // Blue for People
            variant="lean"
          />
        </div>

        {/* Row 2 - Key Metrics */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Key Metrics"
            items={data.keyMetrics}
            onItemsChange={(items) => handleUpdateList('keyMetrics', items)}
            icon={<BarChart3 />}
            accentColor="border-purple-500" // Purple for Data/Metrics
            variant="lean"
          />
        </div>

        {/* Row 2 - Unfair Advantage */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Unfair Advantage"
            items={data.unfairAdvantage}
            onItemsChange={(items) => handleUpdateList('unfairAdvantage', items)}
            icon={<TrendingUp />}
            accentColor="border-indigo-500" // Indigo for Advantage
            variant="lean"
          />
        </div>

        {/* Row 2 - Channels */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Channels"
            items={data.channels}
            onItemsChange={(items) => handleUpdateList('channels', items)}
            icon={<Radio />}
            accentColor="border-cyan-500" // Cyan for Communication
            variant="lean"
          />
        </div>
      </div>

      {/* Bottom Row - Cost Structure & Revenue Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <GenericCanvasBlock
            title="Cost Structure"
            items={data.costStructure}
            onItemsChange={(items) => handleUpdateList('costStructure', items)}
            icon={<TrendingDown />}
            accentColor="border-rose-500" // Rose for Costs
            variant="lean"
          />
        </div>
        <div>
          <GenericCanvasBlock
            title="Revenue Streams"
            items={data.revenueStreams}
            onItemsChange={(items) => handleUpdateList('revenueStreams', items)}
            icon={<DollarSign />}
            accentColor="border-emerald-500" // Emerald for Money
            variant="lean"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
        <p className="font-medium">Lean Canvas</p>
        <p className="opacity-70">Focus on Problems, Solutions & Risks | leanstack.com</p>
      </div>
    </div>
  )
}

