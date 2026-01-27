import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { User } from 'lucide-react'
import { CJMGridView } from './CJMGridView'
import type { CJMData } from '../types'
import { useCJMOperations } from '../hooks/useCJMOperations'
import { CJMTimeline } from './visualization/CJMTimeline'
import { CustomerPerspective } from './visualization/CustomerPerspective'
import { InsightsPerspective } from './visualization/InsightsPerspective'
import { BusinessPerspective } from './visualization/BusinessPerspective'

interface CJMVisualizationProps {
  data: CJMData
  visualizationId: string
  onUpdate?: (data: CJMData) => void
}

export function CJMVisualization({ data, visualizationId, onUpdate }: CJMVisualizationProps) {
  const [selectedStage, setSelectedStage] = useState<number>(0)
  const [viewMode, setViewMode] = useState<'timeline' | 'grid'>('grid')

  const { handleUpdateStage } = useCJMOperations(data, onUpdate)

  if (!data || !data.stages) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No data available for visualization
      </div>
    )
  }

  // Use a helper for tabs to avoid narrowing warnings
  const renderViewToggle = (currentMode: 'timeline' | 'grid') => (
    <div className="flex items-center bg-muted/50 p-1 rounded-lg border">
      <button
        onClick={() => setViewMode('timeline')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          currentMode === 'timeline' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Timeline
      </button>
      <button
        onClick={() => setViewMode('grid')}
        className={cn(
          "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
          currentMode === 'grid' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        Grid View
      </button>
    </div>
  )

  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        <div className="flex justify-end px-4">
          {renderViewToggle('grid')}
        </div>
        <CJMGridView data={data} onUpdate={onUpdate!} />
      </div>
    )
  }

  const currentStage = data.stages[selectedStage]

  return (
    <div id={visualizationId} className="space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/50 dark:from-slate-900/30 dark:to-blue-950/30 p-6 rounded-xl">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Customer Journey
          </h2>
          <p className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            {data.persona}
          </p>
        </div>

        {renderViewToggle('timeline')}
      </div>

      <CJMTimeline
        data={data}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
      />

      {currentStage && (
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Badge className="bg-issue-story">Stage {selectedStage + 1}</Badge>
                  {currentStage.name}
                </h3>
              </div>

              <Accordion type="multiple" className="w-full" defaultValue={['customer-perspective']}>
                <AccordionItem value="customer-perspective">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-issue-story rounded-full" />
                      👤 Customer Perspective
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CustomerPerspective
                      stage={currentStage}
                      onUpdate={(field, val) => handleUpdateStage(selectedStage, field, val)}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="insights">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-gradient-to-b from-green-500 via-yellow-500 to-red-500 rounded-full" />
                      💡 Insights & Opportunities
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <InsightsPerspective
                      stage={currentStage}
                      onUpdate={(field, val) => handleUpdateStage(selectedStage, field, val)}
                    />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="business-perspective">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-warning rounded-full" />
                      🏢 Business Perspective
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <BusinessPerspective
                      stage={currentStage}
                      onUpdate={(field, val) => handleUpdateStage(selectedStage, field, val)}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
