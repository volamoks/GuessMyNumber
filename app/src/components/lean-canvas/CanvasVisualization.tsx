import { AlertTriangle, Lightbulb, TrendingUp, Trophy, Radio, Users, DollarSign, TrendingDown, BarChart3 } from 'lucide-react'

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

interface BlockProps {
  title: string
  items?: string[]
  content?: string
  icon: React.ReactNode
  color: string
  className?: string
}

function CanvasBlock({ title, items, content, icon, color, className = '' }: BlockProps) {
  return (
    <div
      className={`border-2 rounded-lg p-4 h-full min-h-[180px] transition-all hover:shadow-lg ${color} ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-current/20">
        {icon}
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      {content ? (
        <p className="text-sm font-medium leading-relaxed">{content}</p>
      ) : (
        <ul className="space-y-1.5">
          {items?.map((item, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <span className="mt-1 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function CanvasVisualization({ data }: CanvasVisualizationProps) {
  return (
    <div className="space-y-4">
      {/* Classic Lean Canvas Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 auto-rows-fr">
        {/* Row 1 - Problem */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Problem"
            items={data.problem}
            icon={<AlertTriangle className="h-5 w-5" />}
            color="border-red-300 bg-red-50 text-red-900"
          />
        </div>

        {/* Row 1-2 - Unique Value Proposition (center, spans 2 rows) */}
        <div className="lg:col-span-2 lg:row-span-2">
          <CanvasBlock
            title="Unique Value Proposition"
            content={data.uniqueValueProposition}
            icon={<Trophy className="h-5 w-5" />}
            color="border-orange-400 bg-gradient-to-br from-orange-100 to-orange-50 text-orange-900 shadow-md"
            className="border-4"
          />
        </div>

        {/* Row 1 - Solution */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Solution"
            items={data.solution}
            icon={<Lightbulb className="h-5 w-5" />}
            color="border-yellow-300 bg-yellow-50 text-yellow-900"
          />
        </div>

        {/* Row 1 - Customer Segments */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Customer Segments"
            items={data.customerSegments}
            icon={<Users className="h-5 w-5" />}
            color="border-green-300 bg-green-50 text-green-900"
          />
        </div>

        {/* Row 2 - Key Metrics */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Key Metrics"
            items={data.keyMetrics}
            icon={<BarChart3 className="h-5 w-5" />}
            color="border-blue-300 bg-blue-50 text-blue-900"
          />
        </div>

        {/* Row 2 - Unfair Advantage */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Unfair Advantage"
            items={data.unfairAdvantage}
            icon={<TrendingUp className="h-5 w-5" />}
            color="border-purple-300 bg-purple-50 text-purple-900"
          />
        </div>

        {/* Row 2 - Channels */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Channels"
            items={data.channels}
            icon={<Radio className="h-5 w-5" />}
            color="border-teal-300 bg-teal-50 text-teal-900"
          />
        </div>
      </div>

      {/* Bottom Row - Cost Structure & Revenue Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <CanvasBlock
            title="Cost Structure"
            items={data.costStructure}
            icon={<TrendingDown className="h-5 w-5" />}
            color="border-red-400 bg-gradient-to-br from-red-100 to-red-50 text-red-900 shadow-sm"
          />
        </div>
        <div className="lg:col-span-3">
          <CanvasBlock
            title="Revenue Streams"
            items={data.revenueStreams}
            icon={<DollarSign className="h-5 w-5" />}
            color="border-emerald-400 bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-900 shadow-sm"
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
