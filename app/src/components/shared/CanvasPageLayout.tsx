import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { History } from 'lucide-react'
import { toast } from 'sonner'
import { projectsService, type ProjectType } from '@/lib/projects-service'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useExport } from '@/hooks/useExport'
import { useLoadExample } from '@/hooks/useLoadExample'
import { UploadSection } from '@/components/cjm/UploadSection'
import { ExportActions } from '@/components/cjm/ExportActions'
import { AIAnalysisResult } from '@/components/shared/AIAnalysisResult'
import { useGlobalStore } from '@/store'

interface CanvasPageLayoutProps<T> {
  // Page info
  title: string
  description: string

  // Project type
  projectType: ProjectType

  // Example data
  exampleData: T

  // Store state and actions
  data: T | null
  setData: (data: T) => void
  analysis: string | null
  setAnalysis: (analysis: string | null) => void
  currentProjectId: string | null
  setCurrentProjectId: (id: string | null) => void

  // Loading states
  isGenerating: boolean
  setIsGenerating: (value: boolean) => void
  isAnalyzing: boolean
  setIsAnalyzing: (value: boolean) => void
  isImproving: boolean
  setIsImproving: (value: boolean) => void
  isSaving: boolean
  setIsSaving: (value: boolean) => void
  setIsExporting: (value: boolean) => void

  // UI state
  showGenerator: boolean
  setShowGenerator: (value: boolean) => void
  toggleGenerator: () => void
  showVersions: boolean
  setShowVersions: (value: boolean) => void
  versions: any[]
  setVersions: (versions: any[]) => void

  // AI functions
  generateFn: (description: string, language: 'ru' | 'en', projectId?: string) => Promise<T>
  analyzeFn: (data: T, projectId?: string) => Promise<string>
  improveFn: (data: T, analysis?: string, projectId?: string) => Promise<T>

  // Components
  VisualizationComponent: React.ComponentType<{
    data: T
    visualizationId: string
    onUpdate: (data: T) => void
  }>
  GeneratorComponent: React.ComponentType<{
    onGenerate: (description: string, language: 'ru' | 'en') => Promise<void>
    isGenerating: boolean
  }>

  // Data accessors
  getTitle: (data: T) => string
  getDescription?: (data: T) => string | undefined
}

export function CanvasPageLayout<T>({
  title,
  description,
  projectType,
  exampleData,
  data,
  setData,
  analysis,
  setAnalysis,
  currentProjectId,
  setCurrentProjectId,
  isGenerating,
  setIsGenerating,
  isAnalyzing,
  setIsAnalyzing,
  isImproving,
  setIsImproving,
  isSaving,
  setIsSaving,
  setIsExporting,
  showGenerator,
  setShowGenerator,
  toggleGenerator,
  showVersions,
  setShowVersions,
  versions,
  setVersions,
  generateFn,
  analyzeFn,
  improveFn,
  VisualizationComponent,
  GeneratorComponent,
  getTitle,
  getDescription,
}: CanvasPageLayoutProps<T>) {
  const [searchParams] = useSearchParams()
  const { aiModels, activeModelId } = useGlobalStore()

  // Custom hooks
  const { handleFileUpload } = useFileUpload<T>((loadedData) => {
    setData(loadedData)
    setShowGenerator(false)
  })
  const { isExporting, handleExportPDF, handleExportJSON } = useExport()
  const { loadExample } = useLoadExample(exampleData, setData)

  // Sync isExporting state
  useEffect(() => {
    setIsExporting(isExporting)
  }, [isExporting, setIsExporting])

  // Load project on mount
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
        setData(project.data)
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
    if (aiModels.length === 0 || !activeModelId) {
      toast.error('Пожалуйста, добавьте и выберите AI модель в Settings → AI Модели')
      return
    }

    setIsGenerating(true)
    const loadingToast = toast.loading(`Генерация ${title}...`)
    try {
      const generated = await generateFn(description, language, currentProjectId || undefined)
      setData(generated)
      setShowGenerator(false)
      toast.success(`${title} успешно сгенерирован(а)!`, { id: loadingToast })
    } catch (error) {
      toast.error('Ошибка при генерации: ' + (error as Error).message, { id: loadingToast })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnalyze = async () => {
    if (!data) {
      toast.error('Нет данных для анализа')
      return
    }

    if (aiModels.length === 0 || !activeModelId) {
      toast.error('Пожалуйста, добавьте и выберите AI модель в Settings → AI Модели')
      return
    }

    setIsAnalyzing(true)
    const loadingToast = toast.loading('Анализ...')
    try {
      const analysisResult = await analyzeFn(data, currentProjectId || undefined)
      setAnalysis(analysisResult)
      toast.success('Анализ завершен!', { id: loadingToast })
    } catch (error) {
      toast.error('Ошибка при анализе: ' + (error as Error).message, { id: loadingToast })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImprove = async () => {
    if (!data) {
      toast.error('Нет данных для улучшения')
      return
    }

    if (aiModels.length === 0 || !activeModelId) {
      toast.error('Пожалуйста, добавьте и выберите AI модель в Settings → AI Модели')
      return
    }

    setIsImproving(true)
    const loadingToast = toast.loading('Улучшение данных на основе анализа...')
    try {
      const improvedData = await improveFn(data, analysis || undefined, currentProjectId || undefined)
      setData(improvedData)
      toast.success('Данные успешно улучшены! Не забудьте сохранить изменения.', { id: loadingToast })
    } catch (error) {
      toast.error('Ошибка при улучшении: ' + (error as Error).message, { id: loadingToast })
    } finally {
      setIsImproving(false)
    }
  }

  const handleSave = async () => {
    if (!data) return

    setIsSaving(true)
    const loadingToast = toast.loading('Сохранение...')
    try {
      if (currentProjectId) {
        await projectsService.updateProject(currentProjectId, {
          title: getTitle(data),
          data: data,
          description: getDescription?.(data),
        })
        toast.success('Проект обновлён и создана новая версия!', { id: loadingToast })
      } else {
        const project = await projectsService.createProject(
          getTitle(data),
          projectType,
          data,
          getDescription?.(data)
        )
        if (project) {
          setCurrentProjectId(project.id)
          window.history.pushState({}, '', `/${projectType}?projectId=${project.id}`)
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
        setData(restored.data)
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
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {/* Upload/Generate Section */}
      <Card>
        <CardHeader>
          <CardTitle>Загрузка или генерация {title}</CardTitle>
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
            <GeneratorComponent
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          )}
        </CardContent>
      </Card>

      {/* Visualization Section */}
      {data && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>{getTitle(data)}</CardTitle>
                  {getDescription?.(data) && (
                    <CardDescription className="mt-1">{getDescription(data)}</CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  {currentProjectId && (
                    <Button variant="outline" size="sm" onClick={loadVersions}>
                      <History className="mr-2 h-4 w-4" />
                      Версии
                    </Button>
                  )}
                  <ExportActions
                    onExportJSON={() => handleExportJSON(data, `${getTitle(data)}.json`)}
                    onExportPDF={() => handleExportPDF(`${projectType}-visualization`, `${getTitle(data)}.pdf`)}
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
              <VisualizationComponent
                data={data}
                visualizationId={`${projectType}-visualization`}
                onUpdate={setData}
              />
            </CardContent>
          </Card>

          {/* Version History */}
          {showVersions && versions.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>История версий</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowVersions(false)}>
                    Закрыть
                  </Button>
                </div>
                <CardDescription>Выберите версию для восстановления</CardDescription>
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

          {/* AI Analysis Result */}
          {analysis && (
            <AIAnalysisResult
              analysis={analysis}
              onImprove={handleImprove}
              isImproving={isImproving}
            />
          )}
        </>
      )}
    </div>
  )
}
