import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { History } from 'lucide-react'
import { toast } from 'sonner'
import { projectsService, type ProjectType } from '@/lib/projects-service'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useExport } from '@/hooks/useExport'
import { useLoadExample } from '@/hooks/useLoadExample'
import { useCanvasOperations } from '@/hooks/useCanvasOperations'
import { useProjectManagement } from '@/hooks/useProjectManagement'
import { FileUploadZone } from '@/components/shared/FileUploadZone'
import { UnifiedExportActions } from '@/components/shared/UnifiedExportActions'
import { AIAnalysisResult } from '@/components/shared/AIAnalysisResult'
import { useGlobalStore } from '@/store'
import type { Language } from '@/lib/services/ai-prompts'

interface CanvasPageLayoutProps<T> {
  // Page info
  title: string
  description: string
  projectType: ProjectType

  // Example data
  exampleData: T

  // AI operations (from ai-operations.ts)
  generateFn: (description: string, language: Language, projectId?: string) => Promise<T>
  analyzeFn: (data: T, language: Language, projectId?: string) => Promise<string>
  improveFn: (data: T, analysis: string, language: Language, projectId?: string) => Promise<T>

  // Components
  VisualizationComponent: React.ComponentType<{
    data: T
    visualizationId: string
    onUpdate: (data: T) => void
  }>
  GeneratorComponent: React.ComponentType<{
    onGenerate: (description: string, language: Language) => Promise<void>
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

  // Local state
  const [data, setData] = useState<T | null>(null)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [showGenerator, setShowGenerator] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [versions, setVersions] = useState<any[]>([])
  const language: Language = 'ru' // Default language, can be made configurable later

  // Business logic hooks
  const canvasOps = useCanvasOperations<T>({
    generateFn,
    analyzeFn,
    improveFn,
    currentProjectId: currentProjectId || undefined,
  })

  const projectMgmt = useProjectManagement<T>({
    currentProjectId: currentProjectId || undefined,
    saveFn: async (projectId: string, data: T) => {
      await projectsService.updateProject(projectId, {
        title: getTitle(data),
        data: data,
        description: getDescription?.(data),
      })
    },
    loadFn: async (projectId: string) => {
      const project = await projectsService.getProject(projectId)
      return project ? (project.data as T) : null
    },
    onDataLoaded: setData,
  })

  // Utility hooks
  const { handleFileUpload } = useFileUpload<T>((loadedData) => {
    setData(loadedData)
    setShowGenerator(false)
  })
  const { isExporting, handleExportPDF, handleExportJSON } = useExport()
  const { loadExample } = useLoadExample(exampleData, setData)

  // Load project on mount
  useEffect(() => {
    const projectId = searchParams.get('projectId')
    if (projectId) {
      setCurrentProjectId(projectId)
      projectMgmt.load()
    }
  }, [searchParams])

  // Handlers using business logic hooks
  const handleGenerate = async (description: string, lang: Language) => {
    if (aiModels.length === 0 || !activeModelId) {
      toast.error('Пожалуйста, добавьте и выберите AI модель в Settings → AI Модели')
      return
    }

    const result = await canvasOps.generate(description, lang)
    if (result) {
      setData(result)
      setShowGenerator(false)
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

    await canvasOps.analyze(data, language)
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

    const result = await canvasOps.improve(data, language)
    if (result) {
      setData(result)
    }
  }

  const handleSave = async () => {
    if (!data) return

    if (currentProjectId) {
      // Update existing project
      await projectMgmt.save(data)
    } else {
      // Create new project
      const loadingToast = toast.loading('Создание проекта...')
      try {
        const project = await projectsService.createProject(
          getTitle(data),
          projectType,
          data,
          getDescription?.(data)
        )
        if (project) {
          setCurrentProjectId(project.id)
          window.history.pushState({}, '', `/${projectType}?projectId=${project.id}`)
          toast.success('Проект создан!', { id: loadingToast })
        }
      } catch (error) {
        toast.error('Ошибка при создании проекта: ' + (error as Error).message, { id: loadingToast })
      }
    }
  }

  const loadVersions = async () => {
    if (!currentProjectId) return

    const loadingToast = toast.loading('Загрузка версий...')
    try {
      const vers = await projectsService.getProjectVersions(currentProjectId)
      setVersions(vers)
      setShowVersions(true)
      toast.success('Версии загружены', { id: loadingToast })
    } catch (error) {
      toast.error('Ошибка при загрузке версий', { id: loadingToast })
    }
  }

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!currentProjectId) return

    if (!confirm(`Восстановить версию ${versionNumber}? Текущие изменения будут заменены.`)) return

    const loadingToast = toast.loading('Восстановление версии...')
    try {
      const restored = await projectsService.restoreVersion(currentProjectId, versionNumber)
      if (restored) {
        setData(restored.data as T)
        toast.success('Версия успешно восстановлена!', { id: loadingToast })
        setShowVersions(false)
      }
    } catch (error) {
      toast.error('Ошибка при восстановлении версии', { id: loadingToast })
    }
  }

  const toggleGenerator = () => setShowGenerator(!showGenerator)

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
          <FileUploadZone
            onFileUpload={handleFileUpload}
            onLoadExample={loadExample}
            onToggleGenerator={toggleGenerator}
            showGenerator={showGenerator}
            variant="compact"
          />

          {showGenerator && (
            <GeneratorComponent
              onGenerate={handleGenerate}
              isGenerating={canvasOps.isGenerating}
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
                  <UnifiedExportActions
                    onExportJSON={{
                      onClick: () => handleExportJSON(data, `${getTitle(data)}.json`),
                    }}
                    onExportPDF={{
                      onClick: () => handleExportPDF(`${projectType}-visualization`, `${getTitle(data)}.pdf`),
                      isLoading: isExporting,
                    }}
                    onSave={{
                      onClick: handleSave,
                      isLoading: projectMgmt.isSaving,
                    }}
                    onAnalyze={{
                      onClick: handleAnalyze,
                      isLoading: canvasOps.isAnalyzing,
                    }}
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
          {canvasOps.analysis && (
            <AIAnalysisResult
              analysis={canvasOps.analysis}
              onImprove={handleImprove}
              isImproving={canvasOps.isImproving}
            />
          )}
        </>
      )}
    </div>
  )
}
