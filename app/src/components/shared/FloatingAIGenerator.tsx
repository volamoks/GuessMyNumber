import { useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Sparkles, Loader2, Save, CheckCircle2 } from 'lucide-react'
import * as aiService from '@/lib/ai-service'
import { projectsService } from '@/lib/projects-service'
import { useCJMStore, useBusinessCanvasStore, useLeanCanvasStore, useRoadmapStore, useGlobalStore } from '@/store'

type PageContext = 'cjm' | 'business_canvas' | 'lean_canvas' | 'roadmap' | null

const pageConfig = {
  cjm: {
    title: 'Генерация Customer Journey Map',
    description: 'AI создаст CJM на основе вашего описания',
    type: 'cjm' as const,
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
    type: 'business_canvas' as const,
    placeholder: {
      ru: 'Опишите ваш бизнес, продукт или услугу. Например: Мобильное приложение для доставки здоровой еды...',
      en: 'Describe your business, product or service. Example: Mobile app for healthy food delivery...'
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
    type: 'lean_canvas' as const,
    placeholder: {
      ru: 'Опишите вашу бизнес-идею, проблему, которую решаете, и целевую аудиторию...',
      en: 'Describe your business idea, the problem you solve, and target audience...'
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
    type: 'roadmap' as const,
    placeholder: {
      ru: 'Опишите ваш продукт и стратегические цели. Например: SaaS-платформа для управления проектами...',
      en: 'Describe your product and strategic goals. Example: SaaS platform for project management...'
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
  const [projectTitle, setProjectTitle] = useState('')
  const [language, setLanguage] = useState<'ru' | 'en'>('ru')
  const [error, setError] = useState<string | null>(null)

  // Global AI config
  const aiConfig = useGlobalStore((state) => state.ai)

  // CJM Store
  const cjmData = useCJMStore((state) => state.data)
  const cjmIsGenerating = useCJMStore((state) => state.isGenerating)
  const cjmIsSaving = useCJMStore((state) => state.isSaving)
  const setCJMData = useCJMStore((state) => state.setData)
  const setCJMGenerating = useCJMStore((state) => state.setGenerating)
  const setCJMSaving = useCJMStore((state) => state.setSaving)
  const setCJMProjectId = useCJMStore((state) => state.setCurrentProjectId)

  // Business Canvas Store
  const businessData = useBusinessCanvasStore((state) => state.data)
  const businessIsSaving = useBusinessCanvasStore((state) => state.isSaving)
  const setBusinessCanvasData = useBusinessCanvasStore((state) => state.setData)
  const setBusinessSaving = useBusinessCanvasStore((state) => state.setSaving)

  // Lean Canvas Store
  const leanData = useLeanCanvasStore((state) => state.data)
  const leanIsSaving = useLeanCanvasStore((state) => state.isSaving)
  const setLeanCanvasData = useLeanCanvasStore((state) => state.setData)
  const setLeanSaving = useLeanCanvasStore((state) => state.setSaving)

  // Roadmap Store
  const roadmapData = useRoadmapStore((state) => state.data)
  const roadmapIsSaving = useRoadmapStore((state) => state.isSaving)
  const setRoadmapData = useRoadmapStore((state) => state.setData)
  const setRoadmapSaving = useRoadmapStore((state) => state.setSaving)

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

  // Get current data and saving state based on context
  const currentData = context === 'cjm' ? cjmData : context === 'business_canvas' ? businessData : context === 'lean_canvas' ? leanData : roadmapData
  const isSaving = context === 'cjm' ? cjmIsSaving : context === 'business_canvas' ? businessIsSaving : context === 'lean_canvas' ? leanIsSaving : roadmapIsSaving

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError(language === 'ru' ? 'Пожалуйста, опишите ваш бизнес' : 'Please describe your business')
      return
    }

    if (!aiService.isConfigured()) {
      setError(language === 'ru' ? 'AI не настроен. Перейдите в настройки AI' : 'AI not configured. Go to AI settings')
      return
    }

    // Set generating state based on context
    if (context === 'cjm') setCJMGenerating(true)
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
          setRoadmapData(generatedData)
          break
      }

      // Success - keep dialog open for saving
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
      if (context === 'cjm') setCJMGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!currentData) {
      setError(language === 'ru' ? 'Нет данных для сохранения' : 'No data to save')
      return
    }

    if (!projectTitle.trim()) {
      setError(language === 'ru' ? 'Введите название проекта' : 'Enter project title')
      return
    }

    // Set saving state based on context
    switch (context) {
      case 'cjm':
        setCJMSaving(true)
        break
      case 'business_canvas':
        setBusinessSaving(true)
        break
      case 'lean_canvas':
        setLeanSaving(true)
        break
      case 'roadmap':
        setRoadmapSaving(true)
        break
    }

    try {
      // Check if editing existing project
      const projectId = searchParams.get('projectId')

      if (projectId) {
        // Update existing project
        await projectsService.updateProject(projectId, currentData)
      } else {
        // Create new project
        const newProject = await projectsService.createProject(projectTitle, config.type, currentData)
        if (context === 'cjm' && newProject) {
          setCJMProjectId(newProject.id)
        }
      }

      // Success - close dialog
      setOpen(false)
      setProjectTitle('')
      setDescription('')
      setError(null)
    } catch (err) {
      console.error('Save error:', err)
      setError(
        language === 'ru'
          ? 'Ошибка при сохранении в Supabase'
          : 'Error saving to Supabase'
      )
    } finally {
      switch (context) {
        case 'cjm':
          setCJMSaving(false)
          break
        case 'business_canvas':
          setBusinessSaving(false)
          break
        case 'lean_canvas':
          setLeanSaving(false)
          break
        case 'roadmap':
          setRoadmapSaving(false)
          break
      }
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
          <DialogDescription>
            {config.description}
            {aiConfig.isConfigured && (
              <span className="ml-2 text-xs text-primary">
                ({aiConfig.provider})
              </span>
            )}
          </DialogDescription>
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
              className="min-h-[120px] resize-none"
              disabled={cjmIsGenerating}
            />
          </div>

          {/* Project Title - show after generation */}
          {currentData && !searchParams.get('projectId') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'ru' ? 'Название проекта' : 'Project title'}
              </label>
              <Input
                placeholder={language === 'ru' ? 'Введите название' : 'Enter title'}
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                disabled={isSaving}
              />
            </div>
          )}

          {/* Success Message */}
          {currentData && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {language === 'ru' ? 'Сгенерировано! Сохраните проект в базу данных.' : 'Generated! Save the project to database.'}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={cjmIsGenerating || isSaving}>
            {language === 'ru' ? 'Закрыть' : 'Close'}
          </Button>

          {currentData && (
            <Button onClick={handleSave} disabled={isSaving || !projectTitle.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === 'ru' ? 'Сохраняю...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {language === 'ru' ? 'Сохранить' : 'Save'}
                </>
              )}
            </Button>
          )}

          <Button onClick={handleGenerate} disabled={cjmIsGenerating || !description.trim()}>
            {cjmIsGenerating ? (
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
