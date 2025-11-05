import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Sparkles, Loader2 } from 'lucide-react'
import * as aiService from '@/lib/ai-service'
import { projectsService } from '@/lib/projects-service'
import { useCJMStore, useBusinessCanvasStore, useLeanCanvasStore } from '@/store'

type PageContext = 'cjm' | 'business_canvas' | 'lean_canvas' | 'roadmap' | null

const pageConfig = {
  cjm: {
    title: 'Генерация Customer Journey Map',
    description: 'AI создаст CJM на основе вашего описания',
    placeholder: {
      ru: 'Например: Мы продаем онлайн-курсы по программированию для начинающих разработчиков. Наша целевая аудитория - люди 20-35 лет, которые хотят сменить профессию...',
      en: 'Example: We sell online programming courses for beginner developers. Our target audience is 20-35 year olds who want to change careers...'
    },
    buttonText: {
      ru: 'Сгенерировать CJM',
      en: 'Generate CJM'
    },
    generatingText: {
      ru: 'Генерирую CJM...',
      en: 'Generating CJM...'
    }
  },
  business_canvas: {
    title: 'Генерация Business Model Canvas',
    description: 'AI создаст Business Canvas на основе вашего описания',
    placeholder: {
      ru: 'Опишите ваш бизнес, продукт или услугу. Например: Мобильное приложение для доставки здоровой еды. Предлагаем готовые рационы от диетологов с доставкой на дом...',
      en: 'Describe your business, product or service. Example: Mobile app for healthy food delivery. We offer ready-made meal plans from nutritionists with home delivery...'
    },
    buttonText: {
      ru: 'Сгенерировать Canvas',
      en: 'Generate Canvas'
    },
    generatingText: {
      ru: 'Генерирую Canvas...',
      en: 'Generating Canvas...'
    }
  },
  lean_canvas: {
    title: 'Генерация Lean Canvas',
    description: 'AI создаст Lean Canvas на основе вашего описания',
    placeholder: {
      ru: 'Опишите вашу бизнес-идею, проблему, которую решаете, и целевую аудиторию. Например: Платформа для фрилансеров, которая помогает находить проекты через AI-матчинг...',
      en: 'Describe your business idea, the problem you solve, and target audience. Example: Platform for freelancers that helps find projects through AI matching...'
    },
    buttonText: {
      ru: 'Сгенерировать Lean Canvas',
      en: 'Generate Lean Canvas'
    },
    generatingText: {
      ru: 'Генерирую Lean Canvas...',
      en: 'Generating Lean Canvas...'
    }
  },
  roadmap: {
    title: 'Генерация Product Roadmap',
    description: 'AI создаст Roadmap в формате Now-Next-Later',
    placeholder: {
      ru: 'Опишите ваш продукт и стратегические цели. Например: SaaS-платформа для управления проектами. Хотим добавить AI-функции, улучшить мобильное приложение и интеграции...',
      en: 'Describe your product and strategic goals. Example: SaaS platform for project management. We want to add AI features, improve mobile app and integrations...'
    },
    buttonText: {
      ru: 'Сгенерировать Roadmap',
      en: 'Generate Roadmap'
    },
    generatingText: {
      ru: 'Генерирую Roadmap...',
      en: 'Generating Roadmap...'
    }
  }
}

export function FloatingAIGenerator() {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [language, setLanguage] = useState<'ru' | 'en'>('ru')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Store actions
  const setCJMData = useCJMStore((state) => state.setData)
  const setBusinessCanvasData = useBusinessCanvasStore((state) => state.setData)
  const setLeanCanvasData = useLeanCanvasStore((state) => state.setData)

  // Determine current page context
  const getPageContext = (): PageContext => {
    if (location.pathname === '/cjm') return 'cjm'
    if (location.pathname === '/business-canvas') return 'business_canvas'
    if (location.pathname === '/lean-canvas') return 'lean_canvas'
    if (location.pathname === '/roadmap') return 'roadmap'
    return null
  }

  const context = getPageContext()

  // Don't render on pages where AI generation doesn't make sense
  if (!context) return null

  const config = pageConfig[context]

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError(language === 'ru' ? 'Пожалуйста, опишите ваш бизнес' : 'Please describe your business')
      return
    }

    if (!aiService.isConfigured()) {
      setError(language === 'ru' ? 'AI не настроен. Перейдите в настройки' : 'AI not configured. Go to settings')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      let generatedData: any

      // Call appropriate generation function based on context
      switch (context) {
        case 'cjm':
          generatedData = await aiService.generateCJM(description, language)
          setCJMData(generatedData)
          break
        case 'business_canvas':
          generatedData = await aiService.generateBusinessCanvas(description, language)
          setBusinessCanvasData(generatedData)
          break
        case 'lean_canvas':
          generatedData = await aiService.generateLeanCanvas(description, language)
          setLeanCanvasData(generatedData)
          break
        case 'roadmap':
          generatedData = await aiService.generateRoadmap(description, language)
          // TODO: Set roadmap data when store is created
          console.log('Generated roadmap:', generatedData)
          break
      }

      // Try to save to Supabase if projectId is provided
      const projectId = searchParams.get('projectId')
      if (projectId) {
        try {
          await projectsService.updateProject(projectId, generatedData)
        } catch (err) {
          console.warn('Failed to auto-save to Supabase:', err)
        }
      }

      // Close dialog and reset
      setOpen(false)
      setDescription('')
      setError(null)
    } catch (err) {
      console.error('Generation error:', err)
      setError(
        language === 'ru'
          ? 'Ошибка при генерации. Проверьте настройки AI'
          : 'Generation error. Check AI settings'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 h-14 rounded-full shadow-2xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 transition-all hover:scale-105 z-40"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          <span className="font-semibold">AI</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Language Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ru' ? 'Язык генерации' : 'Generation language'}
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

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {language === 'ru'
                ? 'Опишите ваш бизнес и целевую аудиторию'
                : 'Describe your business and target audience'}
            </label>
            <Textarea
              placeholder={config.placeholder[language]}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[150px] resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isGenerating}>
            {language === 'ru' ? 'Отмена' : 'Cancel'}
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !description.trim()}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {config.generatingText[language]}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {config.buttonText[language]}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
