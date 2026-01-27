import { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { MarkdownEditor } from '@/features/presentation/components/MarkdownEditor'
import { SlidePreview } from '@/features/presentation/components/SlidePreview'
import { PresentationControls } from '@/features/presentation/components/PresentationControls'
import { SlideThumbnails } from '@/features/presentation/components/SlideThumbnails'
import { PresentationSettings } from '@/features/presentation/components/PresentationSettings'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PresentationMode } from '@/features/presentation/components/PresentationMode'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, GripVertical, Copy, Settings } from 'lucide-react'
import { MARKDOWN_CHEATSHEET } from '@/features/presentation/utils/markdown-rules'
import { toast } from 'sonner'
import { AICopilotSidebar } from '@/features/ai-copilot/components/AICopilotSidebar'
import { useParams } from 'react-router-dom'
import { useCollaboration } from '../hooks/useCollaboration'
import { usePresentationStore } from '@/store'

export function PresentationPage() {
  const { id } = useParams<{ id: string }>()
  const { status } = useCollaboration(id)

  const [showCheatsheet, setShowCheatsheet] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [thumbnailsWidth, setThumbnailsWidth] = useState(180)
  const [editorWidth, setEditorWidth] = useState(40) // percentage of remaining space
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingThumbnails = useRef(false)
  const isDraggingEditor = useRef(false)

  const { slides, markdown } = usePresentationStore()

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()

    if (isDraggingThumbnails.current) {
      const newWidth = Math.max(120, Math.min(300, e.clientX - containerRect.left))
      setThumbnailsWidth(newWidth)
    }

    if (isDraggingEditor.current) {
      const remainingWidth = containerRect.width - thumbnailsWidth
      const editorX = e.clientX - containerRect.left - thumbnailsWidth
      const newPercent = Math.max(10, Math.min(90, (editorX / remainingWidth) * 100))
      setEditorWidth(newPercent)
    }
  }, [thumbnailsWidth])

  const handleMouseUp = useCallback(() => {
    isDraggingThumbnails.current = false
    isDraggingEditor.current = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [handleMouseMove])

  const startDraggingThumbnails = () => {
    isDraggingThumbnails.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const startDraggingEditor = () => {
    isDraggingEditor.current = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.14)-theme(spacing.10))] flex flex-col bg-background relative">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            Presentation Builder
            {id && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status === 'connected' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                status === 'connecting' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                  'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                {status === 'connected' ? 'Online' : status}
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">
            {id ? 'Collaborating via Supabase' : 'Markdown to PPTX'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showSettings ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Настройки
          </Button>
          <Button
            variant={showCheatsheet ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setShowCheatsheet(!showCheatsheet)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Шпаргалка
          </Button>
        </div>
      </header>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Presentation Settings
            </DialogTitle>
          </DialogHeader>
          <PresentationSettings />
        </DialogContent>
      </Dialog>

      {/* Cheatsheet Dialog */}
      <Dialog open={showCheatsheet} onOpenChange={setShowCheatsheet}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Markdown Cheatsheet
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 mr-6" // Margin for close button
                onClick={() => {
                  navigator.clipboard.writeText(MARKDOWN_CHEATSHEET)
                  toast.success('Copied all rules!')
                }}
              >
                <Copy className="h-4 w-4" />
                Copy All
              </Button>
            </DialogTitle>
          </DialogHeader>
          <article className="prose prose-sm dark:prose-invert max-w-none border rounded-lg p-4 bg-muted/30">
            <ReactMarkdown>{MARKDOWN_CHEATSHEET}</ReactMarkdown>
          </article>
        </DialogContent>
      </Dialog>

      {/* Controls */}
      <PresentationControls />

      {/* Main content with resizable panels */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden relative">
        {/* Thumbnails sidebar */}
        <div
          className="border-r bg-muted/20 overflow-y-auto flex-shrink-0"
          style={{ width: thumbnailsWidth }}
        >
          <div className="p-2 border-b bg-muted/50">
            <h3 className="font-semibold text-xs">Slides</h3>
          </div>
          <SlideThumbnails />
        </div>

        {/* Resize handle for thumbnails */}
        <div
          className="w-1 bg-border hover:bg-primary/50 cursor-col-resize flex items-center justify-center group"
          onMouseDown={startDraggingThumbnails}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </div>

        {/* Editor */}
        <div
          className="border-r overflow-hidden"
          style={{ width: `${editorWidth}%` }}
        >
          <Card className="h-full rounded-none border-0">
            <MarkdownEditor />
          </Card>
        </div>

        {/* Resize handle for editor/preview */}
        <div
          className="w-1 bg-border hover:bg-primary/50 cursor-col-resize flex items-center justify-center group"
          onMouseDown={startDraggingEditor}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
        </div>

        {/* Preview */}
        <div className="flex-1 bg-muted/20 flex flex-col min-w-0">
          <div className="p-2 border-b bg-muted/50">
            <h3 className="font-semibold text-xs">Preview</h3>
          </div>
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <SlidePreview
              className="shadow-2xl transition-all duration-300 transform"
              style={{
                width: '100%',
                maxHeight: '100%',
                aspectRatio: '16/9',
                // Fallback for browsers that handle aspect-ratio + max-height weirdly for width
                margin: 'auto'
              }}
            />
          </div>
        </div>
      </div>

      <AICopilotSidebar
        contextType="presentation"
        contextData={{ slides, markdown }}
      />

      <PresentationMode />
    </div>
  )
}
