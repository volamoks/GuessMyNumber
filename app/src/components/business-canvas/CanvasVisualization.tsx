import { Handshake, Zap, Package, Heart, Radio, Users, DollarSign, TrendingDown } from 'lucide-react'

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

interface BlockProps {
  title: string
  items: string[]
  icon: React.ReactNode
  color: string
  className?: string
}

function CanvasBlock({ title, items, icon, color, className = '' }: BlockProps) {
  return (
    <div
      className={`border-2 rounded-lg p-4 h-full min-h-[200px] transition-all hover:shadow-lg ${color} ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-current/20">
        {icon}
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm flex items-start gap-2">
            <span className="mt-1 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CanvasVisualization({ data }: CanvasVisualizationProps) {
  return (
    <div className="space-y-4">
      {/* Classic Business Model Canvas Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 auto-rows-fr">
        {/* Left Column - Key Partners */}
        <div className="lg:row-span-2">
          <CanvasBlock
            title="Key Partners"
            items={data.keyPartners}
            icon={<Handshake className="h-5 w-5" />}
            color="border-purple-300 bg-purple-50 text-purple-900"
          />
        </div>

        {/* Middle Left Column */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Key Activities"
            items={data.keyActivities}
            icon={<Zap className="h-5 w-5" />}
            color="border-blue-300 bg-blue-50 text-blue-900"
          />
        </div>

        {/* Center Column - Value Proposition (spans 2 rows) */}
        <div className="lg:row-span-2">
          <CanvasBlock
            title="Value Propositions"
            items={data.valueProposition}
            icon={<Package className="h-5 w-5" />}
            color="border-orange-400 bg-gradient-to-br from-orange-100 to-orange-50 text-orange-900 shadow-md"
            className="border-4"
          />
        </div>

        {/* Middle Right Column */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Customer Relationships"
            items={data.customerRelationships}
            icon={<Heart className="h-5 w-5" />}
            color="border-pink-300 bg-pink-50 text-pink-900"
          />
        </div>

        {/* Right Column - Customer Segments (spans 2 rows) */}
        <div className="lg:row-span-2">
          <CanvasBlock
            title="Customer Segments"
            items={data.customerSegments}
            icon={<Users className="h-5 w-5" />}
            color="border-green-300 bg-green-50 text-green-900"
          />
        </div>

        {/* Second row - Key Resources */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Key Resources"
            items={data.keyResources}
            icon={<Package className="h-5 w-5" />}
            color="border-cyan-300 bg-cyan-50 text-cyan-900"
          />
        </div>

        {/* Second row - Channels */}
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
        <p className="font-medium">Business Model Canvas Template</p>
        <p>strategyzer.com | Creative Commons Attribution-Share Alike 3.0</p>
      </div>
    </div>
  )
}
