import { MarkdownEditor } from '@/components/presentation/MarkdownEditor'
import { SlidePreview } from '@/components/presentation/SlidePreview'
import { PresentationControls } from '@/components/presentation/PresentationControls'
import { SlideThumbnails } from '@/components/presentation/SlideThumbnails'
import { Card } from '@/components/ui/card'

export function PresentationPage() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">Presentation Builder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create presentations from Markdown and export to PPTX
        </p>
      </header>

      {/* Controls */}
      <PresentationControls />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails sidebar */}
        <div className="w-48 border-r bg-muted/20 overflow-y-auto">
          <div className="p-3 border-b bg-muted/50">
            <h3 className="font-semibold text-sm">Slides</h3>
          </div>
          <SlideThumbnails />
        </div>

        {/* Editor */}
        <div className="flex-1 border-r">
          <Card className="h-full rounded-none border-0">
            <MarkdownEditor />
          </Card>
        </div>

        {/* Preview */}
        <div className="flex-1 bg-muted/20 flex flex-col">
          <div className="p-3 border-b bg-muted/50">
            <h3 className="font-semibold text-sm">Preview</h3>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="w-full max-w-4xl">
              <SlidePreview className="shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
