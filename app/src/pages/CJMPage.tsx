import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Sparkles, Save, Download, FileDown, Wand2 } from 'lucide-react'
import { aiService } from '@/lib/ai-service'
import { supabase } from '@/lib/supabase'
import { exportToPDF, downloadJSON } from '@/lib/export-utils'

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

export function CJMPage() {
  const [cjmData, setCjmData] = useState<CJMData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [businessDescription, setBusinessDescription] = useState('')
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

  const handleGenerate = async () => {
    if (!businessDescription.trim()) {
      alert('Пожалуйста, опишите ваш бизнес')
      return
    }

    if (!aiService.isConfigured()) {
      alert('Пожалуйста, настройте AI в разделе AI Settings')
      return
    }

    setIsGenerating(true)
    try {
      const generated = await aiService.generateCJM(businessDescription)
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
    if (!cjmData) return

    if (!aiService.isConfigured()) {
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
    const example: CJMData = {
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
    setCjmData(example)
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

      {/* Upload / Generate Section */}
      <Card>
        <CardHeader>
          <CardTitle>Загрузка или генерация CJM</CardTitle>
          <CardDescription>
            Загрузите JSON файл, используйте пример или создайте с помощью AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Загрузить JSON
                    </p>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={loadExample} variant="outline" className="h-24">
                <div className="flex flex-col items-center">
                  <FileDown className="h-6 w-6 mb-1" />
                  <span>Загрузить пример</span>
                </div>
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setShowGenerator(!showGenerator)}
                variant={showGenerator ? "default" : "outline"}
                className="h-24"
              >
                <div className="flex flex-col items-center">
                  <Wand2 className="h-6 w-6 mb-1" />
                  <span>Создать с AI</span>
                </div>
              </Button>
            </div>
          </div>

          {/* AI Generator Form */}
          {showGenerator && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Опишите ваш бизнес и целевую аудиторию
                </label>
                <textarea
                  className="w-full min-h-[120px] p-3 rounded-md border bg-background"
                  placeholder="Например: Мы продаем онлайн-курсы по программированию для начинающих разработчиков. Наша целевая аудитория - люди 20-35 лет, которые хотят сменить профессию..."
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !businessDescription.trim()}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? 'Генерирую CJM...' : 'Сгенерировать CJM с AI'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CJM Visualization */}
      {cjmData && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>{cjmData.title}</CardTitle>
                  <CardDescription>Персона: {cjmData.persona}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleExportJSON} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    JSON
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    variant="outline"
                    size="sm"
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    {isExporting ? 'Экспорт...' : 'PDF'}
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} variant="outline" size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button onClick={handleAnalyze} disabled={isAnalyzing} size="sm">
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isAnalyzing ? 'Анализирую...' : 'Анализ с AI'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div id="cjm-visualization" className="overflow-x-auto bg-white p-4 rounded-lg">
                <div className="flex gap-4 pb-4 min-w-max">
                  {cjmData.stages.map((stage, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-64 p-4 border rounded-lg bg-card shadow-sm"
                    >
                      <h3 className="font-semibold mb-3 text-lg">{stage.name}</h3>

                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Точки контакта:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {stage.touchpoints.map((tp, i) => (
                              <li key={i}>{tp}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Эмоции:</p>
                          <div className="flex flex-wrap gap-1">
                            {stage.emotions.map((em, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-xs">
                                {em}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Pain Points:</p>
                          <ul className="list-disc list-inside space-y-1 text-red-600 dark:text-red-400">
                            {stage.painPoints.map((pp, i) => (
                              <li key={i}>{pp}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Возможности:</p>
                          <ul className="list-disc list-inside space-y-1 text-green-600 dark:text-green-400">
                            {stage.opportunities.map((opp, i) => (
                              <li key={i}>{opp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {aiAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>AI Анализ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">{aiAnalysis}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
