import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Check, X, Edit2 } from 'lucide-react'

interface EditableTextProps {
  text: string
  onChange: (newText: string) => void
  placeholder?: string
}

export function EditableText({ text, onChange, placeholder = 'Введите текст...' }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const handleStartEdit = () => {
    setIsEditing(true)
    setEditValue(text)
  }

  const handleSave = () => {
    if (editValue.trim()) {
      onChange(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditValue('')
  }

  return (
    <div>
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel()
            }}
            className="min-h-[80px] text-sm"
            placeholder={placeholder}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-3 w-3 mr-1" />
              Сохранить
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-3 w-3 mr-1" />
              Отмена
            </Button>
          </div>
        </div>
      ) : (
        <div className="group relative">
          <p 
            className="text-sm font-medium leading-relaxed cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded px-2 py-1 -mx-2 -my-1 transition-colors" 
            onClick={handleStartEdit}
            title="Кликните чтобы редактировать"
          >
            {text}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            onClick={handleStartEdit}
            title="Редактировать"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
