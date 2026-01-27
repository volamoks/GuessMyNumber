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

  const priorityMeta = (priorityConfig as any)[feature.priority] || priorityConfig.medium
  const categoryMeta = (categoryConfig as any)[feature.category] || categoryConfig.feature
  const statusMeta = (statusConfig as any)[feature.status] || statusConfig.planning
  const effortMeta = (effortConfig as any)[feature.effort] || effortConfig.medium

  return (
    <Card className="bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-200 border group items-start text-left">
      {isEditing ? (
        <>
          <CardHeader className="p-3 pb-2 space-y-2.5">
            <Input
              value={editValue.title}
              onChange={(e) => setEditValue({ ...editValue, title: e.target.value })}
              placeholder="Title"
              className="text-sm font-semibold h-8"
              autoFocus
            />
            <Textarea
              value={editValue.description}
              onChange={(e) => setEditValue({ ...editValue, description: e.target.value })}
              placeholder="Description..."
              className="text-xs min-h-[60px] resize-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] items-center text-muted-foreground font-medium uppercase tracking-wider">Start</span>
                  <Input
                    type="date"
                    value={editValue.startDate || ''}
                    onChange={(e) => setEditValue({ ...editValue, startDate: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] items-center text-muted-foreground font-medium uppercase tracking-wider">End</span>
                  <Input
                    type="date"
                    value={editValue.endDate || ''}
                    onChange={(e) => setEditValue({ ...editValue, endDate: e.target.value })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <Select value={editValue.priority} onValueChange={(val: any) => setEditValue({ ...editValue, priority: val })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              <Select value={editValue.status} onValueChange={(val: any) => setEditValue({ ...editValue, status: val })}>
                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 flex gap-2 justify-end">
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-muted" onClick={handleCancel}>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button size="sm" className="h-7 w-7 p-0" onClick={handleSave}>
              <Check className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="p-3 pb-2 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-semibold leading-tight">{feature.title}</CardTitle>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mr-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {feature.description && (
              <CardDescription className="text-xs line-clamp-2 mt-1">{feature.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 font-medium ${priorityMeta.color} bg-transparent border`}>
                {priorityMeta.label}
              </Badge>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 font-normal ${categoryMeta.color} border-0 bg-transparent`}>
                {categoryMeta.label}
              </Badge>
              {(feature.startDate || feature.endDate) && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border bg-muted/20 text-muted-foreground font-mono">
                  {feature.startDate ? new Date(feature.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '...'}
                  {' -> '}
                  {feature.endDate ? new Date(feature.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '...'}
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-dashed text-muted-foreground">
                {effortMeta.icon} {effortMeta.label}
              </Badge>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  )
}
