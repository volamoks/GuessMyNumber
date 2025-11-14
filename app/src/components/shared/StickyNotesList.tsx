import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Plus, X, Check, GripVertical, Edit2 } from 'lucide-react'

interface StickyNotesListProps {
  items: string[]
  onChange: (newItems: string[]) => void
  placeholder?: string
  colorScheme?: 'default' | 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'orange'
}

const colorSchemes = {
  default: {
    card: 'bg-card border-l-4 border-l-border',
    hover: 'hover:shadow-lg hover:-translate-y-0.5',
    gradient: 'hover:border-l-muted-foreground'
  },
  green: {
    card: 'bg-success/10 border-l-4 border-l-success',
    hover: 'hover:shadow-lg hover:shadow-success/20 hover:-translate-y-0.5',
    gradient: 'hover:border-l-success'
  },
  red: {
    card: 'bg-issue-bug/10 border-l-4 border-l-issue-bug',
    hover: 'hover:shadow-lg hover:shadow-issue-bug/20 hover:-translate-y-0.5',
    gradient: 'hover:border-l-issue-bug'
  },
  yellow: {
    card: 'bg-warning/10 border-l-4 border-l-warning',
    hover: 'hover:shadow-lg hover:shadow-warning/20 hover:-translate-y-0.5',
    gradient: 'hover:border-l-warning'
  },
  blue: {
    card: 'bg-issue-story/10 border-l-4 border-l-issue-story',
    hover: 'hover:shadow-lg hover:shadow-issue-story/20 hover:-translate-y-0.5',
    gradient: 'hover:border-l-issue-story'
  },
  purple: {
    card: 'bg-issue-epic/10 border-l-4 border-l-issue-epic',
    hover: 'hover:shadow-lg hover:shadow-issue-epic/20 hover:-translate-y-0.5',
    gradient: 'hover:border-l-issue-epic'
  },
  orange: {
    card: 'bg-warning/10 border-l-4 border-l-warning',
    hover: 'hover:shadow-lg hover:shadow-warning/20 hover:-translate-y-0.5',
    gradient: 'hover:border-l-warning'
  }
}

export function StickyNotesList({
  items,
  onChange,
  placeholder = '>2K9 ?C=:B...',
  colorScheme = 'default'
}: StickyNotesListProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newValue, setNewValue] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const colors = colorSchemes[colorScheme]

  // Drag & Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newItems = [...items]
    const draggedItem = newItems[draggedIndex]
    newItems.splice(draggedIndex, 1)
    newItems.splice(index, 0, draggedItem)

    onChange(newItems)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  // Edit handlers
  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(items[index])
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newItems = [...items]
      newItems[editingIndex] = editValue.trim()
      onChange(newItems)
    }
    setEditingIndex(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingIndex(null)
    setEditValue('')
  }

  const handleDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    onChange(newItems)
  }

  const handleAdd = () => {
    if (newValue.trim()) {
      onChange([...items, newValue.trim()])
      setNewValue('')
      setIsAdding(false)
    }
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewValue('')
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <Card
          key={index}
          draggable={editingIndex !== index}
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`
            group relative
            ${colors.card}
            ${editingIndex === index ? '' : 'cursor-move'}
            ${colors.hover}
            transition-all duration-200
            shadow-sm
            ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}
          `}
        >
          <div className="p-3">
            {editingIndex === index ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                  className="h-8 text-sm"
                  autoFocus
                />
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleSaveEdit}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity cursor-move" />
                <div
                  className="flex-1 text-sm cursor-pointer select-none"
                  onClick={() => handleStartEdit(index)}
                  title=";8:=8B5 GB>1K @540:B8@>20BL"
                >
                  {item}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStartEdit(index)
                    }}
                    title=" 540:B8@>20BL"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(index)
                    }}
                    title="#40;8BL"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}

      {isAdding ? (
        <Card className={`${colors.card} p-3`}>
          <div className="flex items-center gap-2">
            <Input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') handleCancelAdd()
              }}
              placeholder={placeholder}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleAdd}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={handleCancelAdd}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-center h-10 border-dashed hover:border-solid hover:bg-primary/5"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить
        </Button>
      )}
    </div>
  )
}
