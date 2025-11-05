import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Sparkles, Save } from 'lucide-react'
import { aiService } from '@/lib/ai-service'
import { supabase } from '@/lib/supabase'

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

export function LeanCanvasPage() {
  const [canvasData, setCanvasData] = useState<LeanCanvasData | null>(null)
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
    const example: LeanCanvasData = {
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
    setCanvasData(example)
  }

  const CanvasBlock = ({ title, items, content, className = "" }: { title: string, items?: string[], content?: string, className?: string }) => (
    <div className={`p-4 border rounded-lg bg-card ${className}`}>
      <h3 className="font-semibold mb-2 text-sm">{title}</h3>
      {items ? (
        <ul className="space-y-1 text-sm">
          {items.map((item, i) => (
            <li key={i} className="text-muted-foreground">• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{content}</p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lean Canvas</h1>
        <p className="text-muted-foreground">
          Быстро спроектируйте бизнес-модель для стартапа
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Загрузка данных</CardTitle>
          <CardDescription>
            Загрузите JSON файл с данными Lean Canvas или используйте пример
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Нажмите для загрузки JSON
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
          <div className="flex items-center">
            <Button onClick={loadExample} variant="outline">
              Загрузить пример
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Visualization */}
      {canvasData && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{canvasData.title}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                  <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {isAnalyzing ? 'Анализирую...' : 'Анализ с AI'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Row 1 */}
                <CanvasBlock title="Проблема" items={canvasData.problem} className="bg-red-50 dark:bg-red-950/20" />
                <div className="lg:col-span-2">
                  <CanvasBlock
                    title="Уникальное ценностное предложение"
                    content={canvasData.uniqueValueProposition}
                    className="bg-primary/10 lg:row-span-2 h-full"
                  />
                </div>
                <CanvasBlock title="Несправедливое преимущество" items={canvasData.unfairAdvantage} className="bg-yellow-50 dark:bg-yellow-950/20" />
                <CanvasBlock title="Сегменты клиентов" items={canvasData.customerSegments} />

                {/* Row 2 */}
                <CanvasBlock title="Решение" items={canvasData.solution} />
                <CanvasBlock title="Каналы" items={canvasData.channels} />

                {/* Row 3 */}
                <CanvasBlock title="Ключевые метрики" items={canvasData.keyMetrics} />

                {/* Row 4 - Full width */}
                <div className="lg:col-span-2">
                  <CanvasBlock title="Структура издержек" items={canvasData.costStructure} className="bg-red-50 dark:bg-red-950/20" />
                </div>
                <div className="lg:col-span-3">
                  <CanvasBlock title="Потоки доходов" items={canvasData.revenueStreams} className="bg-green-50 dark:bg-green-950/20" />
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
                  <pre className="whitespace-pre-wrap text-sm">{aiAnalysis}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
