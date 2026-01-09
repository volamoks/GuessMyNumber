import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X, Check, Edit2 } from 'lucide-react'

interface EditableListProps {
  items: string[]
  onChange: (newItems: string[]) => void
  placeholder?: string
}

export function EditableList({ items, onChange, placeholder = 'Новый пункт...' }: EditableListProps) {
  // UI state only - это нормально для локального состояния компонента
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [newValue, setNewValue] = useState('')

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditValue(items[index])
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newItems = [...items]
      newItems[editingIndex] = editValue.trim()
      onChange(newItems) // Напрямую в store через callback
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
    onChange(newItems) // Напрямую в store
  }

  const handleAdd = () => {
    if (newValue.trim()) {
      onChange([...items, newValue.trim()]) // Напрямую в store
      setNewValue('')
      setIsAdding(false)
    }
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewValue('')
  }

  return (
    <div className="space-y-1.5">
      {items.map((item, index) => (
        <div key={index} className="group flex items-start gap-2">
          {editingIndex === index ? (
            <div className="flex-1 flex items-center gap-1">
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit()
                  if (e.key === 'Escape') handleCancelEdit()
                }}
                className="h-7 text-sm"
                autoFocus
              />
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleSaveEdit}>
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleCancelEdit}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <>
              <span className="mt-1 flex-shrink-0 text-sm">•</span>
              <span 
                className="flex-1 text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -mx-1 py-0.5 transition-colors" 
                onClick={() => handleStartEdit(index)}
                title="Кликните чтобы редактировать"
              >
                {item}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0" 
                  onClick={() => handleStartEdit(index)}
                  title="Редактировать"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
                  onClick={() => handleDelete(index)}
                  title="Удалить"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}

      {isAdding ? (
        <div className="flex items-center gap-1 mt-2">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
              if (e.key === 'Escape') handleCancelAdd()
            }}
            placeholder={placeholder}
            className="h-7 text-sm"
            autoFocus
          />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleAdd}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={handleCancelAdd}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs mt-1 w-full justify-start opacity-60 hover:opacity-100 hover:bg-primary/10"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Добавить
        </Button>
      )}
    </div>
  )
}
