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
  customerActivities: string[]
  customerGoals: string[]
  touchpoints: string[]
  experience: string[] // emotions/feelings
  positives: string[]
  negatives: string[]
  ideasOpportunities: string[]
  businessGoal: string
  kpis: string[]
  organizationalActivities: string[]
  responsibility: string[]
  technologySystems: string[]
}

interface CJMData {
  title: string
  persona: string
  description?: string
  stages: CJMStage[]
}

const EXAMPLE_CJM: CJMData = {
  title: "Покупка онлайн-курса",
  persona: "Марина, 28 лет, маркетолог",
  description: "Journey map для покупки образовательного онлайн-курса",
  stages: [
    {
      name: "Осознание проблемы",
      customerActivities: ["Ищет информацию в Google", "Смотрит обучающие видео", "Читает статьи"],
      customerGoals: ["Понять текущую проблему", "Найти возможные решения"],
      touchpoints: ["Google поиск", "YouTube", "Социальные сети", "Блоги"],
      experience: ["Любопытство", "Неуверенность", "Растерянность"],
      positives: ["Много бесплатной информации", "Разные форматы контента"],
      negatives: ["Информационный шум", "Сложно выбрать качественный источник"],
      ideasOpportunities: ["SEO оптимизация", "Полезный лид-магнит", "Вебинар для новичков"],
      businessGoal: "Привлечь целевой трафик на сайт",
      kpis: ["Organic traffic +30%", "Время на сайте >3 мин", "Bounce rate <50%"],
      organizationalActivities: ["Создание SEO-контента", "Ведение блога", "SMM активности"],
      responsibility: ["SEO-специалист", "Контент-маркетолог", "SMM-менеджер"],
      technologySystems: ["Google Analytics", "SEMrush", "WordPress", "Social media platforms"]
    },
    {
      name: "Исследование",
      customerActivities: ["Изучает программу курса", "Читает отзывы", "Смотрит демо-урок", "Сравнивает с конкурентами"],
      customerGoals: ["Оценить качество курса", "Понять, подходит ли курс", "Узнать цену"],
      touchpoints: ["Сайт", "Отзывы на сторонних площадках", "Демо-урок", "Email-рассылка"],
      experience: ["Интерес", "Сомнение", "Надежда", "Осторожность"],
      positives: ["Детальная программа", "Бесплатный пробный урок", "Положительные отзывы"],
      negatives: ["Высокая цена", "Мало информации о преподавателе", "Нет чёткой гарантии результата"],
      ideasOpportunities: ["Кейсы выпускников", "Видео-отзывы", "Детальная страница о преподавателе", "FAQ секция"],
      businessGoal: "Конвертировать посетителей в лиды",
      kpis: ["Demo lesson views +50%", "Email subscription rate 25%", "Retargeting CTR 3%"],
      organizationalActivities: ["Разработка лид-магнитов", "Email-маркетинг", "Retargeting кампании"],
      responsibility: ["Email-маркетолог", "Продакт-менеджер", "Performance-маркетолог"],
      technologySystems: ["CRM система", "Email automation", "Facebook Pixel", "Google Ads"]
    },
    {
      name: "Принятие решения",
      customerActivities: ["Выбирает тариф", "Читает условия возврата", "Общается с поддержкой"],
      customerGoals: ["Убедиться в правильности выбора", "Понять условия покупки"],
      touchpoints: ["Страница оплаты", "Чат поддержки", "Email", "Телефон"],
      experience: ["Волнение", "Нервозность", "Надежда", "Предвкушение"],
      positives: ["Разные способы оплаты", "Быстрая поддержка", "Гарантия возврата 14 дней"],
      negatives: ["Сложная форма оплаты", "Неочевидные дополнительные условия"],
      ideasOpportunities: ["Упрощение формы оплаты", "Чёткое указание гарантий", "Онлайн-чат 24/7"],
      businessGoal: "Максимизировать конверсию в покупку",
      kpis: ["Conversion rate 10%", "Cart abandonment <30%", "Support response time <2min"],
      organizationalActivities: ["A/B тестирование страниц", "Обучение поддержки", "Оптимизация checkout"],
      responsibility: ["UX/UI дизайнер", "Head of support", "CRO специалист"],
      technologySystems: ["Payment gateway", "Live chat", "CRM", "Analytics"]
    },
    {
      name: "Использование",
      customerActivities: ["Проходит уроки", "Выполняет задания", "Задаёт вопросы наставнику", "Общается в сообществе"],
      customerGoals: ["Освоить материал", "Получить практические навыки", "Завершить курс"],
      touchpoints: ["LMS платформа", "Чат с наставником", "Сообщество студентов", "Мобильное приложение"],
      experience: ["Удовлетворение", "Вовлечённость", "Иногда фрустрация", "Мотивация"],
      positives: ["Структурированная программа", "Доступность наставника", "Активное сообщество"],
      negatives: ["Периодические технические сбои", "Некоторые задания слишком сложные", "Нехватка времени"],
      ideasOpportunities: ["Техподдержка 24/7", "Адаптивная сложность заданий", "Напоминания о дедлайнах"],
      businessGoal: "Обеспечить высокий уровень завершения курса",
      kpis: ["Course completion rate >70%", "Student satisfaction 4.5+/5", "Support tickets <5/day"],
      organizationalActivities: ["Мониторинг прогресса студентов", "Обучение наставников", "Техподдержка"],
      responsibility: ["Наставники", "Тех. поддержка", "Community менеджер"],
      technologySystems: ["LMS", "Video hosting", "Chat system", "Mobile app", "Progress tracking"]
    },
    {
      name: "Завершение и лояльность",
      customerActivities: ["Получает сертификат", "Делится результатами", "Рекомендует друзьям", "Ищет продолжение"],
      customerGoals: ["Применить знания на практике", "Получить признание", "Продолжить развитие"],
      touchpoints: ["Email рассылка", "Реферальная программа", "Социальные сети", "Карьерный центр"],
      experience: ["Гордость", "Благодарность", "Удовлетворение", "Желание большего"],
      positives: ["Официальный сертификат", "Реальные навыки", "Поддержка комьюнити"],
      negatives: ["Нет чёткого следующего шага", "Потеря контакта после завершения", "Сложно применить знания"],
      ideasOpportunities: ["Продвинутые курсы", "Комьюнити выпускников", "Карьерные консультации", "Партнёрская программа"],
      businessGoal: "Увеличить LTV и привлечь новых клиентов через рекомендации",
      kpis: ["Referral rate 25%", "Repeat purchase 40%", "NPS >50", "Alumni engagement 30%"],
      organizationalActivities: ["Alumni программа", "Карьерная поддержка", "Реферальная система", "Upsell кампании"],
      responsibility: ["Alumni менеджер", "Sales team", "Career advisor"],
      technologySystems: ["Referral platform", "Alumni portal", "Email automation", "Career center"]
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

  const handleGenerate = async (description: string, language: 'ru' | 'en' = 'ru') => {
    if (!aiService.isConfigured()) {
      alert('Пожалуйста, настройте AI в разделе AI Settings')
      return
    }

    setIsGenerating(true)
    try {
      const generated = await aiService.generateCJM(description, language)
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
