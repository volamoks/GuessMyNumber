import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { exportToPDF, downloadJSON } from '@/lib/export-utils'
import { Download, FileJson, Upload } from 'lucide-react'
import { useRoadmapStore, type RoadmapData, type RoadmapFeature } from '@/store'

const EXAMPLE_ROADMAP: RoadmapData = {
  title: "Продуктовая roadmap SaaS платформы",
  description: "Планирование развития платформы для управления проектами на Q1-Q3 2025",
  now: [
    {
      title: "Улучшение мобильного приложения",
      description: "Переработка UI/UX мобильного приложения для iOS и Android",
      priority: "high",
      category: "improvement",
      effort: "large",
      status: "in_progress"
    },
    {
      title: "Интеграция с Slack",
      description: "Двусторонняя интеграция с Slack для уведомлений и управления задачами",
      priority: "high",
      category: "feature",
      effort: "medium",
      status: "planning"
    },
    {
      title: "Исправление багов с нотификациями",
      description: "Устранение проблем с доставкой push-уведомлений",
      priority: "high",
      category: "bug_fix",
      effort: "small",
      status: "done"
    }
  ],
  next: [
    {
      title: "AI-помощник для планирования",
      description: "Интеллектуальный ассистент для автоматического планирования задач",
      priority: "high",
      category: "feature",
      effort: "large",
      status: "planning"
    },
    {
      title: "Продвинутая аналитика",
      description: "Dashboard с метриками производительности команды",
      priority: "medium",
      category: "feature",
      effort: "medium",
      status: "planning"
    },
    {
      title: "Темная тема",
      description: "Поддержка dark mode во всех интерфейсах",
      priority: "medium",
      category: "improvement",
      effort: "small",
      status: "planning"
    },
    {
      title: "Оптимизация производительности",
      description: "Улучшение скорости загрузки на 30%",
      priority: "low",
      category: "tech_debt",
      effort: "medium",
      status: "planning"
    }
  ],
  later: [
    {
      title: "Whiteboard для брейнштормингов",
      description: "Collaborative whiteboard для визуального планирования",
      priority: "medium",
      category: "feature",
      effort: "large",
      status: "planning"
    },
    {
      title: "Видеозвонки в приложении",
      description: "Встроенные видеоконференции без внешних сервисов",
      priority: "low",
      category: "feature",
      effort: "large",
      status: "planning"
    },
    {
      title: "Маркетплейс интеграций",
      description: "Платформа для сторонних разработчиков плагинов",
      priority: "low",
      category: "feature",
      effort: "large",
      status: "planning"
    },
    {
      title: "Офлайн-режим",
      description: "Работа приложения без интернета с синхронизацией",
      priority: "medium",
      category: "feature",
      effort: "large",
      status: "planning"
    },
    {
      title: "API v2",
      description: "Новая версия API с GraphQL поддержкой",
      priority: "low",
      category: "tech_debt",
      effort: "large",
      status: "planning"
    }
  ]
}

const priorityConfig = {
  high: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300' },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300' }
}

const categoryConfig = {
  feature: { label: 'Feature', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  bug_fix: { label: 'Bug Fix', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  tech_debt: { label: 'Tech Debt', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  improvement: { label: 'Improvement', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' }
}

const effortConfig = {
  small: { label: 'Small', icon: '🟢' },
  medium: { label: 'Medium', icon: '🟡' },
  large: { label: 'Large', icon: '🔴' }
}

const statusConfig = {
  planning: { label: 'Planning', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' }
}

function FeatureCard({ feature }: { feature: RoadmapFeature }) {
  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{feature.title}</CardTitle>
          <Badge className={(priorityConfig as any)[feature.priority].color}>
            {(priorityConfig as any)[feature.priority].label}
          </Badge>
        </div>
        <CardDescription className="text-sm mt-2">{feature.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={(categoryConfig as any)[feature.category].color}>
            {(categoryConfig as any)[feature.category].label}
          </Badge>
          <Badge variant="outline" className={(statusConfig as any)[feature.status].color}>
            {(statusConfig as any)[feature.status].label}
          </Badge>
          <Badge variant="outline">
            {(effortConfig as any)[feature.effort].icon} {(effortConfig as any)[feature.effort].label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

export function RoadmapPage() {
  const { data: roadmapData, setData: setRoadmapData } = useRoadmapStore()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        setRoadmapData(json)
      } catch (error) {
        alert('Ошибка при чтении JSON файла')
      }
    }
    reader.readAsText(file)
  }

  const handleLoadExample = () => {
    setRoadmapData(EXAMPLE_ROADMAP)
  }

  const handleExportPDF = () => {
    if (!roadmapData) {
      alert('Нет данных для экспорта')
      return
    }
    exportToPDF('roadmap-container', `roadmap-${roadmapData.title}`)
  }

  const handleExportJSON = () => {
    if (!roadmapData) {
      alert('Нет данных для экспорта')
      return
    }
    downloadJSON(roadmapData, `roadmap-${roadmapData.title}.json`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Product Roadmap
        </h1>
        <p className="text-muted-foreground mt-2">
          Визуализация продуктовой стратегии в формате Now-Next-Later
        </p>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Действия</CardTitle>
          <CardDescription>
            Загрузите JSON с roadmap или создайте с помощью AI
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={handleLoadExample} variant="outline">
            <FileJson className="mr-2 h-4 w-4" />
            Загрузить пример
          </Button>

          <label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Загрузить JSON
              </span>
            </Button>
          </label>

          {roadmapData && (
            <>
              <Button onClick={handleExportJSON} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Скачать JSON
              </Button>
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Экспорт в PDF
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Roadmap Visualization */}
      {roadmapData && (
        <div id="roadmap-container">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">{roadmapData.title}</CardTitle>
              <CardDescription>{roadmapData.description}</CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* NOW Column */}
            <div>
              <Card className="mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <span>Now</span>
                  </CardTitle>
                  <CardDescription>Текущий квартал</CardDescription>
                </CardHeader>
              </Card>
              <div className="space-y-3">
                {roadmapData.now.map((feature, idx) => (
                  <FeatureCard key={idx} feature={feature} />
                ))}
              </div>
            </div>

            {/* NEXT Column */}
            <div>
              <Card className="mb-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    <span>Next</span>
                  </CardTitle>
                  <CardDescription>Следующий квартал</CardDescription>
                </CardHeader>
              </Card>
              <div className="space-y-3">
                {roadmapData.next.map((feature, idx) => (
                  <FeatureCard key={idx} feature={feature} />
                ))}
              </div>
            </div>

            {/* LATER Column */}
            <div>
              <Card className="mb-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    <span>Later</span>
                  </CardTitle>
                  <CardDescription>Будущее</CardDescription>
                </CardHeader>
              </Card>
              <div className="space-y-3">
                {roadmapData.later.map((feature, idx) => (
                  <FeatureCard key={idx} feature={feature} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!roadmapData && (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Roadmap не загружен</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Используйте AI-генерацию, загрузите пример или импортируйте свой JSON
            </p>
            <Button onClick={handleLoadExample} size="lg">
              <FileJson className="mr-2 h-5 w-5" />
              Загрузить пример
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
