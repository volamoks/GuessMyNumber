import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sparkles, Loader2 } from 'lucide-react'

interface AIGeneratorProps {
  onGenerate: (description: string, language: 'ru' | 'en') => Promise<void>
  isGenerating: boolean
}

const LOADING_STEPS = {
  ru: [
    'Анализирую ваш запрос...',
    'Определяю целевую аудиторию...',
    'Продумываю этапы пути клиента...',
    'Генерирую идеи и возможности...',
    'Финальная обработка...',
  ],
  en: [
    'Analyzing your request...',
    'Identifying target audience...',
    'Mapping customer journey stages...',
    'Generating ideas and opportunities...',
    'Finalizing...',
  ],
}

export function AIGenerator({ onGenerate, isGenerating }: AIGeneratorProps) {
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState<'ru' | 'en'>('ru')
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (isGenerating) {
      setCurrentStep(0)
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < LOADING_STEPS[language].length - 1) {
            return prev + 1
          }
          return prev
        })
      }, 2500)
      return () => clearInterval(interval)
    } else {
      setCurrentStep(0)
    }
  }, [isGenerating, language])

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
          disabled={isGenerating}
        />
      </div>

      {isGenerating && (
        <div className="space-y-2 animate-in fade-in duration-300">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{LOADING_STEPS[language][currentStep]}</span>
            <span>{Math.round(((currentStep + 1) / LOADING_STEPS[language].length) * 100)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep + 1) / LOADING_STEPS[language].length) * 100}%` }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={isGenerating || !description.trim()}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'ru' ? 'Генерирую...' : 'Generating...'}
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            {language === 'ru' ? 'Сгенерировать CJM с AI' : 'Generate CJM with AI'}
          </>
        )}
      </Button>
    </div>
  )
}
