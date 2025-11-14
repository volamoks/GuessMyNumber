import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { RoadmapData } from '@/lib/schemas'
import { EditableFeatureCard } from './EditableFeatureCard'
import { toast } from 'sonner'

interface RoadmapVisualizationProps {
  data: RoadmapData
  visualizationId: string
  onUpdate: (data: RoadmapData) => void
}

export function RoadmapVisualization({ data, visualizationId, onUpdate }: RoadmapVisualizationProps) {
  const handleUpdateFeature = (section: 'now' | 'next' | 'later', index: number, updatedFeature: any) => {
    const newData = { ...data }
    newData[section][index] = updatedFeature
    onUpdate(newData)
  }

  const handleDeleteFeature = (section: 'now' | 'next' | 'later', index: number) => {
    if (!confirm('Удалить эту фичу?')) return
    const newData = { ...data }
    newData[section] = newData[section].filter((_, i) => i !== index)
    onUpdate(newData)
    toast.success('Фича удалена')
  }

  return (
    <div id={visualizationId}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{data.title}</CardTitle>
          <CardDescription>{data.description}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* NOW Column */}
        <div>
          <Card className="mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span>Now</span>
              </CardTitle>
              <CardDescription>Текущий квартал</CardDescription>
            </CardHeader>
          </Card>
          <div className="space-y-3">
            {data.now.map((feature, idx) => (
              <EditableFeatureCard
                key={idx}
                feature={feature}
                onUpdate={(updated) => handleUpdateFeature('now', idx, updated)}
                onDelete={() => handleDeleteFeature('now', idx)}
              />
            ))}
          </div>
        </div>

        {/* NEXT Column */}
        <div>
          <Card className="mb-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <span>Next</span>
              </CardTitle>
              <CardDescription>Следующий квартал</CardDescription>
            </CardHeader>
          </Card>
          <div className="space-y-3">
            {data.next.map((feature, idx) => (
              <EditableFeatureCard
                key={idx}
                feature={feature}
                onUpdate={(updated) => handleUpdateFeature('next', idx, updated)}
                onDelete={() => handleDeleteFeature('next', idx)}
              />
            ))}
          </div>
        </div>

        {/* LATER Column */}
        <div>
          <Card className="mb-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💡</span>
                <span>Later</span>
              </CardTitle>
              <CardDescription>Будущее</CardDescription>
            </CardHeader>
          </Card>
          <div className="space-y-3">
            {data.later.map((feature, idx) => (
              <EditableFeatureCard
                key={idx}
                feature={feature}
                onUpdate={(updated) => handleUpdateFeature('later', idx, updated)}
                onDelete={() => handleDeleteFeature('later', idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
