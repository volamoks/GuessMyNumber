import { useState } from 'react'
import {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
} from '@/components/ui/timeline'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StickyNotesList } from '@/components/shared/StickyNotesList'
import { EditableText } from '@/components/shared/EditableText'
import {
  User,
  Target,
  Smartphone,
  Heart,
  TrendingUp,
  BarChart3,
  Users,
  Shield,
  Cpu,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
} from 'lucide-react'

interface CJMStage {
  name: string
  customerActivities: string[]
  customerGoals: string[]
  touchpoints: string[]
  experience: string[]
  positives: string[]
  negatives: string[]
  ideasOpportunities: string[]
  businessGoal: string
  kpis: string[]
  organizationalActivities: string[]
  responsibility: string[]
  technologySystems: string[]
}

interface CJMData {
  title: string
  persona: string
  description?: string
  stages: CJMStage[]
}

interface CJMVisualizationProps {
  data: CJMData
  visualizationId: string
  onUpdate?: (data: CJMData) => void
}

export function CJMVisualization({ data, visualizationId, onUpdate }: CJMVisualizationProps) {
  const [selectedStage, setSelectedStage] = useState<number>(0)

  const handleUpdateStage = (stageIndex: number, field: keyof CJMStage, value: string | string[]) => {
    if (!onUpdate) return
    const newStages = [...data.stages]
    newStages[stageIndex] = { ...newStages[stageIndex], [field]: value }
    onUpdate({ ...data, stages: newStages })
  }

  const getStageStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (index < selectedStage) return 'completed'
    if (index === selectedStage) return 'current'
    return 'upcoming'
  }

  return (
    <div id={visualizationId} className="space-y-8 bg-gradient-to-br from-slate-50/50 to-blue-50/50 dark:from-slate-900/30 dark:to-blue-950/30 p-6 rounded-xl">
      {/* Timeline Header */}
      <div className="text-center space-y-2 pb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Customer Journey
        </h2>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <User className="h-4 w-4" />
          {data.persona}
        </p>
      </div>

      {/* Horizontal Timeline */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-max px-4">
          <Timeline>
            {data.stages.map((stage, index) => (
              <TimelineItem
                key={index}
                status={getStageStatus(index)}
                isLast={index === data.stages.length - 1}
              >
                {/* Connector Line */}
                {index < data.stages.length - 1 && (
                  <TimelineConnector status={getStageStatus(index)} />
                )}

                {/* Timeline Dot */}
                <div
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => setSelectedStage(index)}
                >
                  <TimelineDot status={getStageStatus(index)}>
                    <div className="text-white font-bold text-sm">{index + 1}</div>
                  </TimelineDot>
                </div>

                {/* Stage Title */}
                <TimelineContent>
                  <TimelineTitle className="text-base">{stage.name}</TimelineTitle>
                  <TimelineDescription>
                    {stage.customerGoals.length} goals
                  </TimelineDescription>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </div>

      {/* Selected Stage Details */}
      {data.stages[selectedStage] && (
        <Card className="border-2 shadow-lg">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Badge className="bg-blue-500">Stage {selectedStage + 1}</Badge>
                  {data.stages[selectedStage].name}
                </h3>
              </div>

              <Accordion type="multiple" className="w-full" defaultValue={['customer-perspective']}>
                {/* Customer Perspective */}
                <AccordionItem value="customer-perspective">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-blue-500 rounded-full" />
                      👤 Customer Perspective
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-4 p-4">
                      {/* Customer Activities */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400">
                          <User className="h-4 w-4" />
                          Customer Activities
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].customerActivities}
                          onChange={(items) => handleUpdateStage(selectedStage, 'customerActivities', items)}
                          colorScheme="blue"
                        />
                      </div>

                      {/* Customer Goals */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400">
                          <Target className="h-4 w-4" />
                          Customer Goals
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].customerGoals}
                          onChange={(items) => handleUpdateStage(selectedStage, 'customerGoals', items)}
                          colorScheme="blue"
                        />
                      </div>

                      {/* Touchpoints */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-purple-700 dark:text-purple-400">
                          <Smartphone className="h-4 w-4" />
                          Touchpoints
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].touchpoints}
                          onChange={(items) => handleUpdateStage(selectedStage, 'touchpoints', items)}
                          colorScheme="purple"
                        />
                      </div>

                      {/* Experience */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-purple-700 dark:text-purple-400">
                          <Heart className="h-4 w-4" />
                          Experience
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].experience}
                          onChange={(items) => handleUpdateStage(selectedStage, 'experience', items)}
                          colorScheme="purple"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Insights */}
                <AccordionItem value="insights">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-gradient-to-b from-green-500 via-yellow-500 to-red-500 rounded-full" />
                      💡 Insights & Opportunities
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-3 gap-4 p-4">
                      {/* Positives */}
                      <div className="space-y-3 p-4 rounded-lg">
                        <div className="flex items-center gap-2 font-medium text-green-700 dark:text-green-400">
                          <ThumbsUp className="h-4 w-4" />
                          Positives
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].positives}
                          onChange={(items) => handleUpdateStage(selectedStage, 'positives', items)}
                          colorScheme="green"
                        />
                      </div>

                      {/* Negatives */}
                      <div className="space-y-3 p-4 rounded-lg">
                        <div className="flex items-center gap-2 font-medium text-red-700 dark:text-red-400">
                          <ThumbsDown className="h-4 w-4" />
                          Negatives
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].negatives}
                          onChange={(items) => handleUpdateStage(selectedStage, 'negatives', items)}
                          colorScheme="red"
                        />
                      </div>

                      {/* Ideas & Opportunities */}
                      <div className="space-y-3 p-4 rounded-lg">
                        <div className="flex items-center gap-2 font-medium text-yellow-700 dark:text-yellow-400">
                          <Lightbulb className="h-4 w-4" />
                          Ideas & Opportunities
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].ideasOpportunities}
                          onChange={(items) => handleUpdateStage(selectedStage, 'ideasOpportunities', items)}
                          colorScheme="yellow"
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Business Perspective */}
                <AccordionItem value="business-perspective">
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-orange-500 rounded-full" />
                      🏢 Business Perspective
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid md:grid-cols-2 gap-4 p-4">
                      {/* Business Goal */}
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400">
                          <TrendingUp className="h-4 w-4" />
                          Business Goal
                        </div>
                        <div className="text-sm bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg border border-orange-200 dark:border-orange-900">
                          <EditableText
                            text={data.stages[selectedStage].businessGoal}
                            onChange={(text) => handleUpdateStage(selectedStage, 'businessGoal', text)}
                            placeholder="Business goal..."
                          />
                        </div>
                      </div>

                      {/* KPIs */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400">
                          <BarChart3 className="h-4 w-4" />
                          KPIs
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].kpis}
                          onChange={(items) => handleUpdateStage(selectedStage, 'kpis', items)}
                          colorScheme="orange"
                        />
                      </div>

                      {/* Organizational Activities */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400">
                          <Users className="h-4 w-4" />
                          Organizational Activities
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].organizationalActivities}
                          onChange={(items) => handleUpdateStage(selectedStage, 'organizationalActivities', items)}
                          colorScheme="orange"
                        />
                      </div>

                      {/* Responsibility */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400">
                          <Shield className="h-4 w-4" />
                          Responsibility
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].responsibility}
                          onChange={(items) => handleUpdateStage(selectedStage, 'responsibility', items)}
                          colorScheme="orange"
                        />
                      </div>

                      {/* Technology Systems */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400">
                          <Cpu className="h-4 w-4" />
                          Technology Systems
                        </div>
                        <StickyNotesList
                          items={data.stages[selectedStage].technologySystems}
                          onChange={(items) => handleUpdateStage(selectedStage, 'technologySystems', items)}
                          colorScheme="orange"
                        />
                      </div>
                    </div>
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
