import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit2, Check, X, Trash2 } from 'lucide-react'
import type { RoadmapFeature } from '@/store'

const priorityConfig = {
  high: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300' },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300' }
}

const categoryConfig = {
  feature: { label: 'Feature', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  bug_fix: { label: 'Bug Fix', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  tech_debt: { label: 'Tech Debt', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  improvement: { label: 'Improvement', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' }
}

const effortConfig = {
  small: { label: 'Small', icon: '🟢' },
  medium: { label: 'Medium', icon: '🟡' },
  large: { label: 'Large', icon: '🔴' }
}

const statusConfig = {
  planning: { label: 'Planning', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' }
}

interface EditableFeatureCardProps {
  feature: RoadmapFeature
  onUpdate: (updatedFeature: RoadmapFeature) => void
  onDelete: () => void
}

export function EditableFeatureCard({ feature, onUpdate, onDelete }: EditableFeatureCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(feature)

  const handleSave = () => {
    onUpdate(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(feature)
    setIsEditing(false)
  }

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow group">
      {isEditing ? (
        <>
          <CardHeader className="pb-3 space-y-3">
            <Input
              value={editValue.title}
              onChange={(e) => setEditValue({ ...editValue, title: e.target.value })}
              placeholder="Название фичи"
              className="text-base font-semibold"
            />
            <Textarea
              value={editValue.description}
              onChange={(e) => setEditValue({ ...editValue, description: e.target.value })}
              placeholder="Описание"
              className="text-sm min-h-[60px]"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select value={editValue.priority} onValueChange={(val: any) => setEditValue({ ...editValue, priority: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editValue.category} onValueChange={(val: any) => setEditValue({ ...editValue, category: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug_fix">Bug Fix</SelectItem>
                  <SelectItem value="tech_debt">Tech Debt</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editValue.status} onValueChange={(val: any) => setEditValue({ ...editValue, status: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editValue.effort} onValueChange={(val: any) => setEditValue({ ...editValue, effort: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">🟢 Small</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="large">🔴 Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0 flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-3 w-3 mr-1" />
              Сохранить
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-3 w-3 mr-1" />
              Отмена
            </Button>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <CardDescription className="text-sm mt-2">{feature.description}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              <Badge className={(priorityConfig as any)[feature.priority].color}>
                {(priorityConfig as any)[feature.priority].label}
              </Badge>
              <Badge variant="outline" className={(categoryConfig as any)[feature.category].color}>
                {(categoryConfig as any)[feature.category].label}
              </Badge>
              <Badge variant="outline" className={(statusConfig as any)[feature.status].color}>
                {(statusConfig as any)[feature.status].label}
              </Badge>
              <Badge variant="outline">
                {(effortConfig as any)[feature.effort].icon} {(effortConfig as any)[feature.effort].label}
              </Badge>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
