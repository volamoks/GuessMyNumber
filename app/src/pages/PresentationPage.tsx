import { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import { MarkdownEditor } from '@/components/presentation/MarkdownEditor'
import { SlidePreview } from '@/components/presentation/SlidePreview'
import { PresentationControls } from '@/components/presentation/PresentationControls'
import { SlideThumbnails } from '@/components/presentation/SlideThumbnails'
import { PresentationSettings } from '@/components/presentation/PresentationSettings'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, X, GripVertical, Copy, Settings } from 'lucide-react'
import { MARKDOWN_CHEATSHEET } from '@/lib/markdown-rules'
import { toast } from 'sonner'

export function PresentationPage() {
  const [showCheatsheet, setShowCheatsheet] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [thumbnailsWidth, setThumbnailsWidth] = useState(180)
  const [editorWidth, setEditorWidth] = useState(50) // percentage of remaining space
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingThumbnails = useRef(false)
  const isDraggingEditor = useRef(false)

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
      const newPercent = Math.max(30, Math.min(70, (editorX / remainingWidth) * 100))
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
    <div className="h-[calc(100vh-theme(spacing.14)-theme(spacing.10))] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Presentation Builder</h1>
          <p className="text-xs text-muted-foreground">
            Markdown to PPTX
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

      {/* Settings Panel */}
      {showSettings && (
        <Card className="mx-4 mt-2 p-4 bg-muted/50 relative max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-muted/50 pb-2">
            <h3 className="font-semibold text-sm">⚙️ Настройки презентации</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowSettings(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <PresentationSettings />
        </Card>
      )}

      {/* Cheatsheet Panel */}
      {showCheatsheet && (
        <Card className="mx-4 mt-2 p-4 bg-muted/50 relative max-h-[400px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 sticky top-0 bg-muted/50 pb-2">
            <h3 className="font-semibold text-sm">📖 Markdown Шпаргалка для Презентаций</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(MARKDOWN_CHEATSHEET)
                  toast.success('Скопировано в буфер обмена!')
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                <span className="text-xs">Копировать всё</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowCheatsheet(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Markdown Preview with prose styling */}
          <article className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{MARKDOWN_CHEATSHEET}</ReactMarkdown>
          </article>
        </Card>
      )}

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
          <div className="flex-1 p-4 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-4xl">
              <SlidePreview className="shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
