import { Handshake, Zap, Package, Heart, Radio, Users, DollarSign, TrendingDown } from 'lucide-react'
import { EditableList } from '@/components/shared/EditableList'

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

interface BlockProps {
  title: string
  items: string[]
  onItemsChange: (newItems: string[]) => void
  icon: React.ReactNode
  color: string
  className?: string
}

function CanvasBlock({ title, items, onItemsChange, icon, color, className = '' }: BlockProps) {
  return (
    <div className={`border-2 rounded-lg p-4 h-full min-h-[200px] transition-all hover:shadow-lg ${color} ${className}`}>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-current/20">
        {icon}
        <h3 className="font-bold text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <EditableList items={items} onChange={onItemsChange} placeholder="Добавить..." />
    </div>
  )
}

export function CanvasVisualization({ data, visualizationId, onUpdate }: CanvasVisualizationProps) {
  // Обновляет напрямую store через onUpdate callback
  const handleUpdate = (field: keyof BusinessCanvasData, newItems: string[]) => {
    onUpdate({
      ...data,
      [field]: newItems,
    })
  }

  return (
    <div id={visualizationId} className="space-y-4">
      {/* Classic Business Model Canvas Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 auto-rows-fr">
        {/* Left Column - Key Partners */}
        <div className="lg:row-span-2">
          <CanvasBlock
            title="Key Partners"
            items={data.keyPartners}
            onItemsChange={(items) => handleUpdate('keyPartners', items)}
            icon={<Handshake className="h-5 w-5" />}
            color="border-issue-epic/30 bg-issue-epic/10 text-foreground"
          />
        </div>

        {/* Middle Left Column */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Key Activities"
            items={data.keyActivities}
            onItemsChange={(items) => handleUpdate('keyActivities', items)}
            icon={<Zap className="h-5 w-5" />}
            color="border-issue-story/30 bg-issue-story/10 text-foreground"
          />
        </div>

        {/* Center Column - Value Proposition (spans 2 rows) */}
        <div className="lg:row-span-2">
          <CanvasBlock
            title="Value Propositions"
            items={data.valueProposition}
            onItemsChange={(items) => handleUpdate('valueProposition', items)}
            icon={<Package className="h-5 w-5" />}
            color="border-warning/50 bg-gradient-to-br from-warning/20 to-warning/10 text-foreground shadow-md"
            className="border-4"
          />
        </div>

        {/* Middle Right Column */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Customer Relationships"
            items={data.customerRelationships}
            onItemsChange={(items) => handleUpdate('customerRelationships', items)}
            icon={<Heart className="h-5 w-5" />}
            color="border-issue-bug/30 bg-issue-bug/10 text-foreground"
          />
        </div>

        {/* Right Column - Customer Segments (spans 2 rows) */}
        <div className="lg:row-span-2">
          <CanvasBlock
            title="Customer Segments"
            items={data.customerSegments}
            onItemsChange={(items) => handleUpdate('customerSegments', items)}
            icon={<Users className="h-5 w-5" />}
            color="border-success/30 bg-success/10 text-foreground"
          />
        </div>

        {/* Second row - Key Resources */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Key Resources"
            items={data.keyResources}
            onItemsChange={(items) => handleUpdate('keyResources', items)}
            icon={<Package className="h-5 w-5" />}
            color="border-info/30 bg-info/10 text-foreground"
          />
        </div>

        {/* Second row - Channels */}
        <div className="lg:row-span-1">
          <CanvasBlock
            title="Channels"
            items={data.channels}
            onItemsChange={(items) => handleUpdate('channels', items)}
            icon={<Radio className="h-5 w-5" />}
            color="border-issue-task/30 bg-issue-task/10 text-foreground"
          />
        </div>
      </div>

      {/* Bottom Row - Cost Structure & Revenue Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <CanvasBlock
            title="Cost Structure"
            items={data.costStructure}
            onItemsChange={(items) => handleUpdate('costStructure', items)}
            icon={<TrendingDown className="h-5 w-5" />}
            color="border-issue-bug/50 bg-gradient-to-br from-issue-bug/20 to-issue-bug/10 text-foreground shadow-sm"
          />
        </div>
        <div className="lg:col-span-3">
          <CanvasBlock
            title="Revenue Streams"
            items={data.revenueStreams}
            onItemsChange={(items) => handleUpdate('revenueStreams', items)}
            icon={<DollarSign className="h-5 w-5" />}
            color="border-success/50 bg-gradient-to-br from-success/20 to-success/10 text-foreground shadow-sm"
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
