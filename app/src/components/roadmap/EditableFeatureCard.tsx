import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit2, Check, X, Trash2 } from 'lucide-react'
import type { RoadmapFeature } from '@/lib/schemas'

const priorityConfig = {
  high: { label: 'High', color: 'bg-priority-high/10 text-priority-high border-priority-high/30' },
  medium: { label: 'Medium', color: 'bg-priority-medium/10 text-priority-medium border-priority-medium/30' },
  low: { label: 'Low', color: 'bg-priority-low/10 text-priority-low border-priority-low/30' }
}

const categoryConfig = {
  feature: { label: 'Feature', color: 'bg-issue-story/10 text-issue-story border-issue-story/30' },
  bug_fix: { label: 'Bug Fix', color: 'bg-issue-bug/10 text-issue-bug border-issue-bug/30' },
  tech_debt: { label: 'Tech Debt', color: 'bg-warning/10 text-warning border-warning/30' },
  improvement: { label: 'Improvement', color: 'bg-success/10 text-success border-success/30' }
}

const effortConfig = {
  small: { label: 'Small', icon: '🟢' },
  medium: { label: 'Medium', icon: '🟡' },
  large: { label: 'Large', icon: '🔴' }
}

const statusConfig = {
  planning: { label: 'Planning', color: 'bg-status-todo/10 text-status-todo border-status-todo/30' },
  in_progress: { label: 'In Progress', color: 'bg-status-in-progress/10 text-status-in-progress border-status-in-progress/30' },
  done: { label: 'Done', color: 'bg-status-done/10 text-status-done border-status-done/30' }
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
