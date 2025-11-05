import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles } from 'lucide-react'

interface AIGeneratorProps {
  onGenerate: (description: string, language: 'ru' | 'en') => Promise<void>
  isGenerating: boolean
}

export function AIGenerator({ onGenerate, isGenerating }: AIGeneratorProps) {
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState<'ru' | 'en'>('ru')

  const handleSubmit = async () => {
    if (!description.trim()) {
      alert('Пожалуйста, опишите ваш бизнес')
      return
    }
    await onGenerate(description, language)
    setDescription('')
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Язык генерации / Generation language
        </label>
        <Select value={language} onValueChange={(val) => setLanguage(val as 'ru' | 'en')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ru">🇷🇺 Русский</SelectItem>
            <SelectItem value="en">🇬🇧 English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {language === 'ru'
            ? 'Опишите ваш бизнес и целевую аудиторию'
            : 'Describe your business and target audience'}
        </label>
        <textarea
          className="w-full min-h-[120px] p-3 rounded-md border bg-background"
          placeholder={
            language === 'ru'
              ? "Например: Мы продаем онлайн-курсы по программированию для начинающих разработчиков. Наша целевая аудитория - люди 20-35 лет, которые хотят сменить профессию..."
              : "Example: We sell online programming courses for beginner developers. Our target audience is 20-35 year olds who want to change careers..."
          }
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
        {isGenerating
          ? (language === 'ru' ? 'Генерирую CJM...' : 'Generating CJM...')
          : (language === 'ru' ? 'Сгенерировать CJM с AI' : 'Generate CJM with AI')}
      </Button>
    </div>
  )
}
