import { Handshake, Zap, Package, Heart, Radio, Users, DollarSign, TrendingDown } from 'lucide-react'
import { GenericCanvasBlock } from '@/components/shared/GenericCanvasBlock'

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
  visualizationId: string
  onUpdate: (data: BusinessCanvasData) => void
}

export function CanvasVisualization({ data, visualizationId, onUpdate }: CanvasVisualizationProps) {
  // Direct store update via callback
  const handleUpdate = (field: keyof BusinessCanvasData, newItems: string[]) => {
    onUpdate({
      ...data,
      [field]: newItems,
    })
  }

  return (
    <div id={visualizationId} className="space-y-6">
      {/* Classic Business Model Canvas Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 auto-rows-fr">
        {/* Left Column - Key Partners */}
        <div className="lg:row-span-2">
          <GenericCanvasBlock
            title="Key Partners"
            items={data.keyPartners}
            onItemsChange={(items) => handleUpdate('keyPartners', items)}
            icon={<Handshake />}
            accentColor="border-blue-500"
            variant="business"
          />
        </div>

        {/* Middle Left Column */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Key Activities"
            items={data.keyActivities}
            onItemsChange={(items) => handleUpdate('keyActivities', items)}
            icon={<Zap />}
            accentColor="border-cyan-500"
            variant="business"
          />
        </div>

        {/* Center Column - Value Proposition (spans 2 rows) */}
        <div className="lg:row-span-2">
          <GenericCanvasBlock
            title="Value Propositions"
            items={data.valueProposition}
            onItemsChange={(items) => handleUpdate('valueProposition', items)}
            icon={<Package />}
            accentColor="border-yellow-500"
            className="bg-gradient-to-b from-yellow-50/50 to-transparent dark:from-yellow-950/10"
            variant="business"
          />
        </div>

        {/* Middle Right Column */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Customer Relationships"
            items={data.customerRelationships}
            onItemsChange={(items) => handleUpdate('customerRelationships', items)}
            icon={<Heart />}
            accentColor="border-pink-500"
            variant="business"
          />
        </div>

        {/* Right Column - Customer Segments (spans 2 rows) */}
        <div className="lg:row-span-2">
          <GenericCanvasBlock
            title="Customer Segments"
            items={data.customerSegments}
            onItemsChange={(items) => handleUpdate('customerSegments', items)}
            icon={<Users />}
            accentColor="border-green-500"
            variant="business"
          />
        </div>

        {/* Second row - Key Resources */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Key Resources"
            items={data.keyResources}
            onItemsChange={(items) => handleUpdate('keyResources', items)}
            icon={<Package />} // Reusing Package icon or find a better one? Package is fine for resources.
            accentColor="border-indigo-500"
            variant="business"
          />
        </div>

        {/* Second row - Channels */}
        <div className="lg:row-span-1">
          <GenericCanvasBlock
            title="Channels"
            items={data.channels}
            onItemsChange={(items) => handleUpdate('channels', items)}
            icon={<Radio />}
            accentColor="border-purple-500"
            variant="business"
          />
        </div>
      </div>

      {/* Bottom Row - Cost Structure & Revenue Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <GenericCanvasBlock
            title="Cost Structure"
            items={data.costStructure}
            onItemsChange={(items) => handleUpdate('costStructure', items)}
            icon={<TrendingDown />}
            accentColor="border-orange-500"
            variant="business"
          />
        </div>
        <div>
          <GenericCanvasBlock
            title="Revenue Streams"
            items={data.revenueStreams}
            onItemsChange={(items) => handleUpdate('revenueStreams', items)}
            icon={<DollarSign />}
            accentColor="border-emerald-500"
            variant="business"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border/50">
        <p className="font-medium">Business Model Canvas</p>
        <p className="opacity-70">Designed for 2026 Strategy Standards</p>
      </div>
    </div>
  )
}

