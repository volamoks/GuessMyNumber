import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import * as aiService from '@/lib/ai-service'
import { supabase } from '@/lib/supabase'
import { UploadSection } from '@/components/lean-canvas/UploadSection'
import { CanvasVisualization } from '@/components/lean-canvas/CanvasVisualization'
import { ExportActions } from '@/components/lean-canvas/ExportActions'
import { AIAnalysisResult } from '@/components/shared/AIAnalysisResult'
import { useLeanCanvasStore } from '@/store'

interface LeanCanvasData {
  title: string
  problem: string[]
  solution: string[]
  keyMetrics: string[]
  uniqueValueProposition: string
  unfairAdvantage: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
}

const EXAMPLE_CANVAS: LeanCanvasData = {
  title: "Приложение для изучения языков с AI",
  problem: [
    "Скучные традиционные курсы",
    "Дорогие репетиторы",
    "Нет практики с носителями"
  ],
  solution: [
    "AI-собеседник для практики",
    "Персонализированная программа",
    "Геймификация обучения"
  ],
  keyMetrics: [
    "DAU (Daily Active Users)",
    "Retention rate (7-day, 30-day)",
    "Время обучения в день",
    "Conversion to paid"
  ],
  uniqueValueProposition: "Изучайте языки в разговорах с AI, как с реальным собеседником",
  unfairAdvantage: [
    "Уникальная база диалогов",
    "Патентованный алгоритм адаптации",
    "Команда экспертов в лингвистике"
  ],
  channels: [
    "App Store / Google Play",
    "TikTok / Instagram Reels",
    "Образовательные блогеры",
    "SEO контент"
  ],
  customerSegments: [
    "Молодежь 18-25 (студенты)",
    "Профессионалы 25-40",
    "Путешественники"
  ],
  costStructure: [
    "AI API costs",
    "Разработка и поддержка",
    "User acquisition",
    "Контент и локализация"
  ],
  revenueStreams: [
    "Freemium модель",
    "Premium подписка ($9.99/мес)",
    "Корпоративные лицензии",
    "In-app purchases (специальные курсы)"
  ]
}

export function LeanCanvasPage() {
  // Use Zustand store instead of useState
  const {
    data: canvasData,
    analysis: aiAnalysis,
    isAnalyzing,
    isSaving,
    setData: setCanvasData,
    setAnalysis: setAiAnalysis,
    setAnalyzing: setIsAnalyzing,
    setSaving: setIsSaving,
  } = useLeanCanvasStore()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        setCanvasData(json)
      } catch (error) {
        alert('Ошибка при чтении JSON файла')
      }
    }
    reader.readAsText(file)
  }

  const handleAnalyze = async () => {
    if (!canvasData) return

    if (!aiService.isConfigured()) {
      alert('Пожалуйста, настройте AI в разделе AI Settings')
      return
    }

    setIsAnalyzing(true)
    try {
      const analysis = await aiService.analyzeLeanCanvas(canvasData)
      setAiAnalysis(analysis)
    } catch (error) {
      alert('Ошибка при анализе: ' + (error as Error).message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!canvasData) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          title: canvasData.title,
          type: 'lean_canvas',
          data: canvasData
        })

      if (error) throw error
      alert('Проект сохранён!')
    } catch (error) {
      alert('Ошибка при сохранении: ' + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const loadExample = () => {
    setCanvasData(EXAMPLE_CANVAS)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lean Canvas</h1>
        <p className="text-muted-foreground">
          Быстро спроектируйте бизнес-модель для стартапа
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Загрузка данных</CardTitle>
          <CardDescription>
            Загрузите JSON файл с данными Lean Canvas или используйте пример
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadSection
            onFileUpload={handleFileUpload}
            onLoadExample={loadExample}
          />
        </CardContent>
      </Card>

      {canvasData && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{canvasData.title}</CardTitle>
                </div>
                <ExportActions
                  onSave={handleSave}
                  onAnalyze={handleAnalyze}
                  isSaving={isSaving}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </CardHeader>
            <CardContent>
              <CanvasVisualization data={canvasData} />
            </CardContent>
          </Card>

          {aiAnalysis && <AIAnalysisResult analysis={aiAnalysis} />}
        </>
      )}
    </div>
  )
}
