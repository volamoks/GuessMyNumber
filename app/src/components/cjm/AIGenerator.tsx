import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

interface AIGeneratorProps {
  onGenerate: (description: string) => Promise<void>
  isGenerating: boolean
}

export function AIGenerator({ onGenerate, isGenerating }: AIGeneratorProps) {
  const [description, setDescription] = useState('')

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert('Пожалуйста, опишите ваш бизнес')
      return
    }
    await onGenerate(description)
    setDescription('')
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Опишите ваш бизнес и целевую аудиторию
        </label>
        <textarea
          className="w-full min-h-[120px] p-3 rounded-md border bg-background"
          placeholder="Например: Мы продаем онлайн-курсы по программированию для начинающих разработчиков. Наша целевая аудитория - люди 20-35 лет, которые хотят сменить профессию..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isGenerating || !description.trim()}
        className="w-full"
      >
        <Sparkles className="mr-2 h-4 w-4" />
        {isGenerating ? 'Генерирую CJM...' : 'Сгенерировать CJM с AI'}
      </Button>
    </div>
  )
}
