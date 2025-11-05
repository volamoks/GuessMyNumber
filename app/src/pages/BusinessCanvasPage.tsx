import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { aiService } from '@/lib/ai-service'
import { supabase } from '@/lib/supabase'
import { UploadSection } from '@/components/business-canvas/UploadSection'
import { CanvasVisualization } from '@/components/business-canvas/CanvasVisualization'
import { ExportActions } from '@/components/business-canvas/ExportActions'
import { AIAnalysisResult } from '@/components/shared/AIAnalysisResult'

interface BusinessCanvasData {
  title: string
  keyPartners: string[]
  keyActivities: string[]
  keyResources: string[]
  valueProposition: string[]
  customerRelationships: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
}

const EXAMPLE_CANVAS: BusinessCanvasData = {
  title: "SaaS платформа для управления проектами",
  keyPartners: [
    "Cloud провайдеры (AWS, GCP)",
    "Payment processors",
    "Integration partners"
  ],
  keyActivities: [
    "Разработка платформы",
    "Поддержка клиентов",
    "Маркетинг и продажи"
  ],
  keyResources: [
    "Команда разработки",
    "Серверная инфраструктура",
    "Интеллектуальная собственность"
  ],
  valueProposition: [
    "Простое управление проектами",
    "Интеграция с популярными инструментами",
    "Доступная цена",
    "Отличная поддержка"
  ],
  customerRelationships: [
    "Self-service онбординг",
    "Email поддержка",
    "Комьюнити форум",
    "Персональный менеджер (Enterprise)"
  ],
  channels: [
    "Веб-сайт",
    "Контент-маркетинг",
    "Партнёрские программы",
    "Прямые продажи (Enterprise)"
  ],
  customerSegments: [
    "Малый бизнес (5-50 человек)",
    "Стартапы",
    "Enterprise компании",
    "Фрилансеры"
  ],
  costStructure: [
    "Зарплаты команды",
    "Инфраструктура (серверы, hosting)",
    "Маркетинг и реклама",
    "Поддержка клиентов"
  ],
  revenueStreams: [
    "Месячная подписка ($29/месяц)",
    "Годовая подписка со скидкой",
    "Enterprise план ($299/месяц)",
    "Дополнительные интеграции"
  ]
}

export function BusinessCanvasPage() {
  const [canvasData, setCanvasData] = useState<BusinessCanvasData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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
      const analysis = await aiService.analyzeBusinessCanvas(canvasData)
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
          type: 'business_canvas',
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
        <h1 className="text-3xl font-bold tracking-tight">Business Model Canvas</h1>
        <p className="text-muted-foreground">
          Спроектируйте и проанализируйте вашу бизнес-модель
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Загрузка данных</CardTitle>
          <CardDescription>
            Загрузите JSON файл с данными Business Canvas или используйте пример
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
