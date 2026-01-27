import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { History, Sparkles, Upload } from 'lucide-react'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Use AI Store
  const { isAIConfigured } = useAIStore()
  const hasKey = isAIConfigured()

  // Use Project Store
  // Use Project Store - Individual selectors to satisfy getSnapshot stability
  const data = useProjectStore(state => state.data) as T | null
  const setData = useProjectStore(state => state.updateData)
  const currentProjectId = useProjectStore(state => state.currentProjectId)
  const setCurrentProjectId = useProjectStore(state => state.setCurrentProjectId)
  const loadProject = useProjectStore(state => state.loadProject)
  const saveProject = useProjectStore(state => state.saveProject)
  const createProject = useProjectStore(state => state.createProject)
  const isLoading = useProjectStore(state => state.isLoading)
  const isSaving = useProjectStore(state => state.isSaving)
  const error = useProjectStore(state => state.error)

  const [showGenerator, setShowGenerator] = useState(false)
  const language: Language = 'ru'

  // Business logic hooks
  const canvasOps = useCanvasOperations<T>({
    generateFn,
    analyzeFn,
    improveFn,
    currentProjectId: currentProjectId || undefined,
  })

  // Utility hooks
  const { handleFileUpload } = useFileUpload<T>((loadedData) => {
    setData(loadedData)
    setShowGenerator(false)
  })
  const { isExporting, handleExportPDF, handleExportJSON } = useExport()
  const { loadExample } = useLoadExample(exampleData, (d) => setData(d as any))

  // File Input Ref
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const triggerImport = () => fileInputRef.current?.click()

  // Sync URL with Store and Load Data
  useEffect(() => {
    const urlProjectId = searchParams.get('projectId')

    if (urlProjectId && urlProjectId !== currentProjectId) {
      // URL has ID, store doesn't match -> Sync Store to URL
      setCurrentProjectId(urlProjectId)
      loadProject(urlProjectId)
    } else if (!urlProjectId && currentProjectId) {
      // Store has ID, URL doesn't -> Sync URL to Store
      setSearchParams({ projectId: currentProjectId }, { replace: true })
      if (!data) loadProject(currentProjectId)
    } else if (currentProjectId && !data && !isLoading && !error) {
      // We have ID and no data, try loading (e.g. refresh)
      loadProject(currentProjectId)
    }
  }, [searchParams, currentProjectId, loadProject, setSearchParams, data, isLoading, error])


  // Auto-Save Logic
  const [lastSavedData, setLastSavedData] = useState<T | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  // Initial data load snapshot
  useEffect(() => {
    if (data && !lastSavedData) {
      setLastSavedData(data)
    }
  }, [data, lastSavedData])

  useEffect(() => {
    if (!data || !currentProjectId || !lastSavedData) return
    if (JSON.stringify(data) === JSON.stringify(lastSavedData)) return

    const timer = setTimeout(async () => {
      setIsAutoSaving(true)
      await saveProject(data, true) // silent save
      setLastSavedData(data)
      setIsAutoSaving(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [data, currentProjectId, lastSavedData, saveProject])

  // Handlers
  const handleGenerate = async (description: string, lang: Language) => {
    if (!hasKey) {
      toast.error('AI не настроен. Пожалуйста, добавьте API ключ в настройках.')
      return
    }
    const result = await canvasOps.generate(description, lang)
    if (result) {
      setData(result)
      setShowGenerator(false)
      // If we have a project, save it
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
      // Create new project
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

      {/* Hidden File Input */}
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
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              </div>
            </div>
            <p className="text-muted-foreground animate-pulse">Loading project...</p>
          </div>
        ) : error ? (
          <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="p-6 rounded-full bg-destructive/10 text-destructive mb-2">
              <History className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold">Unable to load project</h3>
            <p className="text-muted-foreground max-w-sm text-center">
              {error === 'Project not found' ? "We couldn't find this project." : "An error occurred while loading."}
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => navigate('/projects')}>
                Back to Projects
              </Button>
              <Button onClick={() => loadProject(currentProjectId!)}>
                Try Again
              </Button>
            </div>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="p-8 rounded-full bg-background border shadow-lg relative">
                <Sparkles className="h-16 w-16 text-primary" />
              </div>
            </div>

            <div className="space-y-3 max-w-lg">
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Create {projectType === 'cjm' ? 'Customer Journey' : 'New Project'}
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Start by importing existing data or let AI help you structure your ideas in seconds.
              </p>
            </div>

            <div className="flex gap-4 p-2 rounded-2xl bg-muted/30 backdrop-blur border">
              <Button onClick={() => setShowGenerator(true)} size="lg" className="h-12 px-8 gap-2 shadow-md hover:shadow-lg transition-all rounded-xl">
                <Sparkles className="h-5 w-5" />
                Generate with AI
              </Button>
              <Button variant="outline" size="lg" onClick={triggerImport} className="h-12 px-8 gap-2 bg-background/50 hover:bg-background rounded-xl">
                <Upload className="h-5 w-5" />
                Import JSON
              </Button>
              <Button variant="ghost" size="lg" onClick={loadExample} className="h-12 px-6 rounded-xl hover:bg-muted/50">
                Load Example
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <VisualizationComponent
              data={data}
              visualizationId={`${projectType}-visualization`}
              onUpdate={setData}
            />

            {/* AI Analysis Result */}
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

      {/* AI Generator Dialog */}
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

// Helper to update document title
function TitleUpdater({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | CJM Builder`
  }, [title])
  return null
}
