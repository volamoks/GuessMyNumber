import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { exportToPDF, downloadJSON } from '@/lib/export-utils'
import { FileJson } from 'lucide-react'
import { useRoadmapStore, type RoadmapData } from '@/store'
import { ActionsBar } from '@/components/shared/ActionsBar'
import { EditableFeatureCard } from '@/components/roadmap/EditableFeatureCard'

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

export function RoadmapPage() {
  const { data: roadmapData, setData: setRoadmapData } = useRoadmapStore()

  const handleUpdateFeature = (section: 'now' | 'next' | 'later', index: number, updatedFeature: any) => {
    if (!roadmapData) return
    const newData = { ...roadmapData }
    newData[section][index] = updatedFeature
    setRoadmapData(newData)
  }

  const handleDeleteFeature = (section: 'now' | 'next' | 'later', index: number) => {
    if (!roadmapData) return
    if (!confirm('Удалить эту фичу?')) return
    const newData = { ...roadmapData }
    newData[section] = newData[section].filter((_, i) => i !== index)
    setRoadmapData(newData)
  }

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
      <ActionsBar
        onLoadExample={handleLoadExample}
        onFileUpload={handleFileUpload}
        onExportJSON={handleExportJSON}
        onExportPDF={handleExportPDF}
        hasData={!!roadmapData}
        exampleLabel="Загрузить пример"
        title="Действия"
        description="Загрузите JSON с roadmap или создайте с помощью AI"
      />

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
                  <EditableFeatureCard
                    key={idx}
                    feature={feature}
                    onUpdate={(updated) => handleUpdateFeature('now', idx, updated)}
                    onDelete={() => handleDeleteFeature('now', idx)}
                  />
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
                  <EditableFeatureCard
                    key={idx}
                    feature={feature}
                    onUpdate={(updated) => handleUpdateFeature('next', idx, updated)}
                    onDelete={() => handleDeleteFeature('next', idx)}
                  />
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
                  <EditableFeatureCard
                    key={idx}
                    feature={feature}
                    onUpdate={(updated) => handleUpdateFeature('later', idx, updated)}
                    onDelete={() => handleDeleteFeature('later', idx)}
                  />
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
