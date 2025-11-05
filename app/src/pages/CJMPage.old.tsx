import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import * as aiService from '@/lib/ai-service'
import { projectsService } from '@/lib/projects-service'
import { AIGenerator } from '@/components/cjm/AIGenerator'
import { CJMVisualization } from '@/components/cjm/CJMVisualization'
import { UploadSection } from '@/components/cjm/UploadSection'
import { ExportActions } from '@/components/cjm/ExportActions'
import { AIAnalysisResult } from '@/components/shared/AIAnalysisResult'
import { History } from 'lucide-react'
import { useCJMStore, useGlobalStore } from '@/store'
import { toast } from 'sonner'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useExport } from '@/hooks/useExport'
import { useLoadExample } from '@/hooks/useLoadExample'
import { EXAMPLE_CJM } from '@/data/examples/cjm'

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

export function CJMPage() {
  const [searchParams] = useSearchParams()

  // Use Zustand store instead of multiple useState
  const {
    data: cjmData,
    analysis: aiAnalysis,
    currentProjectId,
    isGenerating,
    isAnalyzing,
    isSaving,
    showGenerator,
    showVersions,
    versions,
    setData: setCjmData,
    setAnalysis: setAiAnalysis,
    setCurrentProjectId,
    setGenerating: setIsGenerating,
    setAnalyzing: setIsAnalyzing,
    setSaving: setIsSaving,
    setExporting: setIsExporting,
    setShowGenerator,
    setShowVersions,
    setVersions,
    toggleGenerator,
  } = useCJMStore()

  // Get AI models from global store
  const { aiModels, activeModelId } = useGlobalStore()

  // Custom hooks for common operations
  const { handleFileUpload } = useFileUpload<CJMData>((data) => {
    setCjmData(data)
    setShowGenerator(false)
  })
  const { isExporting, handleExportPDF, handleExportJSON } = useExport()
  const { loadExample } = useLoadExample(EXAMPLE_CJM, setCjmData)

  // Update isExporting in store when hook changes
  useEffect(() => {
    setIsExporting(isExporting)
  }, [isExporting, setIsExporting])

  // Загрузка проекта при монтировании
  useEffect(() => {
    const projectId = searchParams.get('projectId')
    if (projectId) {
      loadProject(projectId)
    }
  }, [searchParams])

  const loadProject = async (projectId: string) => {
    try {
      const project = await projectsService.getProject(projectId)
      if (project) {
        setCjmData(project.data)
        setCurrentProjectId(project.id)
      }
    } catch (error) {
      toast.error('Ошибка при загрузке проекта')
    }
  }

  const loadVersions = async () => {
    if (!currentProjectId) return
    try {
      const vers = await projectsService.getProjectVersions(currentProjectId)
      setVersions(vers)
      setShowVersions(true)
    } catch (error) {
      toast.error('Ошибка при загрузке версий')
    }
  }

  const handleGenerate = async (description: string, language: 'ru' | 'en' = 'ru') => {
    // Check new AI system first
    if (aiModels.length === 0 || !activeModelId) {
      toast.error('Пожалуйста, добавьте и выберите AI модель в Settings → AI Модели')
      return
    }

    setIsGenerating(true)
    const loadingToast = toast.loading('Генерация CJM...')
    try {
      const generated = await aiService.generateCJM(description, language)
      setCjmData(generated)
      setShowGenerator(false)
      toast.success('CJM успешно сгенерирована!', { id: loadingToast })
    } catch (error) {
      toast.error('Ошибка при генерации: ' + (error as Error).message, { id: loadingToast })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnalyze = async () => {
    if (!cjmData) {
      toast.error('Нет данных для анализа')
      return
    }

    // Check new AI system first
    if (aiModels.length === 0 || !activeModelId) {
      toast.error('Пожалуйста, добавьте и выберите AI модель в Settings → AI Модели')
      return
    }

    setIsAnalyzing(true)
    const loadingToast = toast.loading('Анализ CJM...')
    try {
      const analysis = await aiService.analyzeCJM(cjmData, currentProjectId || undefined)
      setAiAnalysis(analysis)
      toast.success('Анализ завершен!', { id: loadingToast })
    } catch (error) {
      toast.error('Ошибка при анализе: ' + (error as Error).message, { id: loadingToast })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!cjmData) return

    setIsSaving(true)
    const loadingToast = toast.loading('Сохранение...')
    try {
      if (currentProjectId) {
        // Обновляем существующий проект
        await projectsService.updateProject(currentProjectId, {
          title: cjmData.title,
          data: cjmData,
          description: cjmData.description,
        })
        toast.success('Проект обновлён и создана новая версия!', { id: loadingToast })
      } else {
        // Создаём новый проект
        const project = await projectsService.createProject(
          cjmData.title,
          'cjm',
          cjmData,
          cjmData.description
        )
        if (project) {
          setCurrentProjectId(project.id)
          // Обновляем URL с ID проекта
          window.history.pushState({}, '', `/cjm?projectId=${project.id}`)
        }
        toast.success('Проект сохранён!', { id: loadingToast })
      }
    } catch (error) {
      toast.error('Ошибка при сохранении: ' + (error as Error).message, { id: loadingToast })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!currentProjectId) return

    if (!confirm(`Восстановить версию ${versionNumber}? Текущие изменения будут заменены.`)) return

    const loadingToast = toast.loading('Восстановление версии...')
    try {
      const restored = await projectsService.restoreVersion(currentProjectId, versionNumber)
      if (restored) {
        setCjmData(restored.data)
        toast.success('Версия успешно восстановлена!', { id: loadingToast })
        setShowVersions(false)
      }
    } catch (error) {
      toast.error('Ошибка при восстановлении версии', { id: loadingToast })
    }
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
            onToggleGenerator={toggleGenerator}
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
                  {cjmData.description && (
                    <CardDescription className="mt-1">{cjmData.description}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  {currentProjectId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadVersions}
                    >
                      <History className="mr-2 h-4 w-4" />
                      Версии
                    </Button>
                  )}
                  <ExportActions
                    onExportJSON={() => cjmData && handleExportJSON(cjmData, `${cjmData.title}.json`)}
                    onExportPDF={() => cjmData && handleExportPDF('cjm-visualization', `${cjmData.title}.pdf`)}
                    onSave={handleSave}
                    onAnalyze={handleAnalyze}
                    isExporting={isExporting}
                    isSaving={isSaving}
                    isAnalyzing={isAnalyzing}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CJMVisualization
                data={cjmData}
                visualizationId="cjm-visualization"
                onUpdate={setCjmData}
              />
            </CardContent>
          </Card>

          {/* История версий */}
          {showVersions && versions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>История версий</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowVersions(false)}>
                    Закрыть
                  </Button>
                </div>
                <CardDescription>
                  Выберите версию для восстановления
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">Версия #{version.version_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(version.created_at).toLocaleString('ru-RU')}
                        </p>
                        {version.change_description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {version.change_description}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreVersion(version.version_number)}
                      >
                        Восстановить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {aiAnalysis && <AIAnalysisResult analysis={aiAnalysis} />}
        </>
      )}
    </div>
  )
}
