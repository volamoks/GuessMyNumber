import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { ProjectType } from '@/lib/projects-service'
import { useFileUpload } from '@/hooks/useFileUpload'
import { useExport } from '@/hooks/useExport'
import { useLoadExample } from '@/hooks/useLoadExample'
import { useCanvasOperations } from '@/features/canvases/hooks/useCanvasOperations'
import { useProjectStore } from '@/store/projectStore'
import { ActionToolbar } from '@/components/shared/ActionToolbar'
import { PageHeader } from '@/components/shared/PageHeader'
import { AIAnalysisResult } from '@/components/shared/AIAnalysisResult'
import { useAIStore } from '@/store/aiStore'
import type { Language } from '@/lib/services/ai-prompts'
import { AICopilotSidebar } from '@/features/ai-copilot/components/AICopilotSidebar'
import { useCanvasPageSync } from '../hooks/useCanvasPageSync'
import { useCanvasAutoSave } from '../hooks/useCanvasAutoSave'
import { CanvasLoadingState, CanvasErrorState, CanvasEmptyState } from './layout/CanvasStates'

interface CanvasPageLayoutProps<T> {
  title: string
  description: string
  projectType: ProjectType
  exampleData: T
  generateFn: (description: string, language: Language, projectId?: string) => Promise<T>
  analyzeFn: (data: T, language: Language, projectId?: string) => Promise<string>
  improveFn: (data: T, analysis: string, language: Language, projectId?: string) => Promise<T>
  VisualizationComponent: React.ComponentType<{
    data: T
    visualizationId: string
    onUpdate: (data: T) => void
  }>
  GeneratorComponent: React.ComponentType<{
    onGenerate: (description: string, language: Language) => Promise<void>
    isGenerating: boolean
  }>
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
  const navigate = useNavigate()

  const { isAIConfigured } = useAIStore()
  const hasKey = isAIConfigured()

  const data = useProjectStore(state => state.data) as T | null
  const setData = useProjectStore(state => state.updateData)
  const currentProjectId = useProjectStore(state => state.currentProjectId)
  const loadProject = useProjectStore(state => state.loadProject)
  const saveProject = useProjectStore(state => state.saveProject)
  const createProject = useProjectStore(state => state.createProject)
  const isLoading = useProjectStore(state => state.isLoading)
  const isSaving = useProjectStore(state => state.isSaving)
  const error = useProjectStore(state => state.error)

  const [showGenerator, setShowGenerator] = useState(false)
  const language: Language = 'ru'

  const canvasOps = useCanvasOperations<T>({
    generateFn,
    analyzeFn,
    improveFn,
    currentProjectId: currentProjectId || undefined,
  })

  useCanvasPageSync<T>(data)
  const { isAutoSaving, setLastSavedData } = useCanvasAutoSave<T>(data)

  const { handleFileUpload } = useFileUpload<T>((loadedData) => {
    setData(loadedData)
    setShowGenerator(false)
  })
  const { isExporting, handleExportPDF, handleExportJSON } = useExport()
  const { loadExample } = useLoadExample(exampleData, (d) => setData(d as any))

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const triggerImport = () => fileInputRef.current?.click()

  const handleGenerate = async (description: string, lang: Language) => {
    if (!hasKey) {
      toast.error('AI не настроен. Пожалуйста, добавьте API ключ в настройках.')
      return
    }
    const result = await canvasOps.generate(description, lang)
    if (result) {
      setData(result)
      setShowGenerator(false)
      if (currentProjectId) {
        await saveProject(result)
        setLastSavedData(result)
      }
    }
  }

  const handleImprove = async () => {
    if (!data || !hasKey) {
      toast.error(data ? 'AI не настроен' : 'Нет данных для улучшения')
      return
    }
    const result = await canvasOps.improve(data, language)
    if (result) setData(result)
  }

  const handleSave = async () => {
    if (!data) return
    if (currentProjectId) {
      await saveProject(data)
      setLastSavedData(data)
    } else {
      const newId = await createProject(
        getTitle(data),
        projectType,
        data,
        getDescription?.(data)
      )
      if (newId) {
        setLastSavedData(data)
        navigate(`/${projectType}?projectId=${newId}`, { replace: true })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background/50 pb-20">
      <TitleUpdater title={data ? getTitle(data) : title} />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      <PageHeader
        title={data ? getTitle(data) : title}
        description={data ? getDescription?.(data) : description}
        showBackButton={true}
        backTo="/projects"
      >
        <div className="flex items-center gap-2">
          {isAutoSaving && (
            <span className="text-xs text-muted-foreground animate-pulse mr-2">
              Saving...
            </span>
          )}
          <ActionToolbar
            onImportJSON={triggerImport}
            onExportJSON={data ? () => handleExportJSON(data, `${getTitle(data)}.json`) : undefined}
            onExportPDF={data ? () => handleExportPDF(`${projectType}-visualization`, `${getTitle(data)}.pdf`) : undefined}
            isExporting={isExporting}
            onAiGenerate={() => setShowGenerator(true)}
            isAiGenerating={canvasOps.isGenerating}
            customActions={data && (
              <Button size="sm" onClick={handleSave} disabled={isSaving || isAutoSaving}>
                {isSaving || isAutoSaving ? 'Saved' : 'Save'}
              </Button>
            )}
          />
        </div>
      </PageHeader>

      <div className="w-full px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {isLoading ? (
          <CanvasLoadingState />
        ) : error ? (
          <CanvasErrorState error={error} onRetry={() => loadProject(currentProjectId!)} />
        ) : !data ? (
          <CanvasEmptyState
            projectType={projectType}
            onShowGenerator={() => setShowGenerator(true)}
            triggerImport={triggerImport}
            loadExample={loadExample}
          />
        ) : (
          <div className="space-y-8">
            <VisualizationComponent
              data={data}
              visualizationId={`${projectType}-visualization`}
              onUpdate={setData}
            />

            {canvasOps.analysis && (
              <AIAnalysisResult
                analysis={canvasOps.analysis}
                onImprove={handleImprove}
                isImproving={canvasOps.isImproving}
              />
            )}

            <AICopilotSidebar
              contextType={projectType}
              contextData={data}
            />
          </div>
        )}
      </div>

      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Генератор</DialogTitle>
            <DialogDescription>
              Опишите ваш продукт, и AI создаст структуру {projectType} для вас.
            </DialogDescription>
          </DialogHeader>
          <GeneratorComponent
            onGenerate={handleGenerate}
            isGenerating={canvasOps.isGenerating}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TitleUpdater({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | CJM Builder`
  }, [title])
  return null
}
