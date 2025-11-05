import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { aiService } from '@/lib/ai-service'
import { supabase } from '@/lib/supabase'
import { exportToPDF, downloadJSON } from '@/lib/export-utils'
import { AIGenerator } from '@/components/cjm/AIGenerator'
import { CJMVisualization } from '@/components/cjm/CJMVisualization'
import { UploadSection } from '@/components/cjm/UploadSection'
import { ExportActions } from '@/components/cjm/ExportActions'
import { AIAnalysisResult } from '@/components/shared/AIAnalysisResult'

interface CJMStage {
  name: string
  touchpoints: string[]
  emotions: string[]
  painPoints: string[]
  opportunities: string[]
}

interface CJMData {
  title: string
  persona: string
  stages: CJMStage[]
}

const EXAMPLE_CJM: CJMData = {
  title: "Покупка онлайн-курса",
  persona: "Марина, 28 лет, маркетолог",
  stages: [
    {
      name: "Осознание проблемы",
      touchpoints: ["Google поиск", "YouTube", "Социальные сети"],
      emotions: ["Любопытство", "Неуверенность"],
      painPoints: ["Слишком много информации", "Не понятно с чего начать"],
      opportunities: ["SEO оптимизация", "Полезный контент в блоге"]
    },
    {
      name: "Исследование",
      touchpoints: ["Сайт", "Отзывы", "Демо-урок"],
      emotions: ["Интерес", "Сомнение"],
      painPoints: ["Высокая цена", "Непонятная программа"],
      opportunities: ["Детальная программа курса", "Отзывы выпускников"]
    },
    {
      name: "Принятие решения",
      touchpoints: ["Страница оплаты", "Email поддержка"],
      emotions: ["Волнение", "Надежда"],
      painPoints: ["Сложный процесс оплаты", "Непонятные условия возврата"],
      opportunities: ["Упрощение оплаты", "Гарантия возврата денег"]
    },
    {
      name: "Использование",
      touchpoints: ["Платформа курса", "Чат с наставником", "Сообщество"],
      emotions: ["Удовлетворение", "Иногда фрустрация"],
      painPoints: ["Технические проблемы", "Сложные задания"],
      opportunities: ["Техподдержка 24/7", "Дополнительные материалы"]
    },
    {
      name: "Лояльность",
      touchpoints: ["Email рассылка", "Реферальная программа"],
      emotions: ["Гордость", "Благодарность"],
      painPoints: ["Нет продолжения", "Нет общения после курса"],
      opportunities: ["Продвинутые курсы", "Комьюнити выпускников"]
    }
  ]
}

export function CJMPage() {
  const [cjmData, setCjmData] = useState<CJMData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        setCjmData(json)
        setShowGenerator(false)
      } catch (error) {
        alert('Ошибка при чтении JSON файла')
      }
    }
    reader.readAsText(file)
  }

  const handleGenerate = async (description: string) => {
    if (!aiService.isConfigured()) {
      alert('Пожалуйста, настройте AI в разделе AI Settings')
      return
    }

    setIsGenerating(true)
    try {
      const generated = await aiService.generateCJM(description)
      setCjmData(generated)
      setShowGenerator(false)
      alert('CJM успешно сгенерирована!')
    } catch (error) {
      alert('Ошибка при генерации: ' + (error as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnalyze = async () => {
    if (!cjmData || !aiService.isConfigured()) {
      alert('Пожалуйста, настройте AI в разделе AI Settings')
      return
    }

    setIsAnalyzing(true)
    try {
      const analysis = await aiService.analyzeCJM(cjmData)
      setAiAnalysis(analysis)
    } catch (error) {
      alert('Ошибка при анализе: ' + (error as Error).message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!cjmData) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          title: cjmData.title,
          type: 'cjm',
          data: cjmData
        })

      if (error) throw error
      alert('Проект сохранён!')
    } catch (error) {
      alert('Ошибка при сохранении: ' + (error as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async () => {
    if (!cjmData) return

    setIsExporting(true)
    try {
      await exportToPDF('cjm-visualization', `${cjmData.title}.pdf`)
    } catch (error) {
      alert('Ошибка при экспорте: ' + (error as Error).message)
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportJSON = () => {
    if (!cjmData) return
    downloadJSON(cjmData, `${cjmData.title}.json`)
  }

  const loadExample = () => {
    setCjmData(EXAMPLE_CJM)
    setShowGenerator(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Journey Map</h1>
        <p className="text-muted-foreground">
          Визуализируйте и анализируйте путь вашего клиента
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Загрузка или генерация CJM</CardTitle>
          <CardDescription>
            Загрузите JSON файл, используйте пример или создайте с помощью AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadSection
            onFileUpload={handleFileUpload}
            onLoadExample={loadExample}
            onToggleGenerator={() => setShowGenerator(!showGenerator)}
            showGenerator={showGenerator}
          />

          {showGenerator && (
            <AIGenerator
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          )}
        </CardContent>
      </Card>

      {cjmData && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>{cjmData.title}</CardTitle>
                  <CardDescription>Персона: {cjmData.persona}</CardDescription>
                </div>
                <ExportActions
                  onExportJSON={handleExportJSON}
                  onExportPDF={handleExportPDF}
                  onSave={handleSave}
                  onAnalyze={handleAnalyze}
                  isExporting={isExporting}
                  isSaving={isSaving}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            </CardHeader>
            <CardContent>
              <CJMVisualization
                data={cjmData}
                visualizationId="cjm-visualization"
              />
            </CardContent>
          </Card>

          {aiAnalysis && <AIAnalysisResult analysis={aiAnalysis} />}
        </>
      )}
    </div>
  )
}
