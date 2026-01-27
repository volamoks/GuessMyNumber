import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, ChevronLeft, ChevronRight, Save, FileText, Wand2, LayoutTemplate, Import, MoreHorizontal, Play, Share2 } from 'lucide-react'
import { usePresentationStore } from '@/store'
import { DEFAULT_THEMES, DEFAULT_TEMPLATES } from '@/features/presentation/types'
import { toast } from 'sonner'
import { AIGeneratorDialog } from './AIGeneratorDialog'
import { CrossModuleImporter } from '@/components/shared/CrossModuleImporter'

import { usePresentationExport } from '../hooks/usePresentationExport'
import { usePresentationSync } from '../hooks/usePresentationSync'

export function PresentationControls() {
  const store = usePresentationStore()
  const { slides, currentSlideIndex, theme, isExporting, currentPresentation, markdown } = store
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const { handleExportPptx, handleExportPdf } = usePresentationExport()
  const { handleSave, handleShare } = usePresentationSync()

  const loadTemplate = (templateId: string) => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      if (confirm('This will replace your current content. Continue?')) {
        store.setMarkdown(template.content)
        toast.success(`Loaded template: ${template.name} `)
      }
    }
  }

  const handleImport = (importedMarkdown: string) => {
    const newMarkdown = markdown + '\n\n---\n\n' + importedMarkdown
    store.setMarkdown(newMarkdown)
  }

  return (
    <>
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={store.prevSlide}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3">
              {slides.length > 0 ? `${currentSlideIndex + 1} / ${slides.length}` : '0 / 0'}
            </span >
            <Button
              variant="outline"
              size="sm"
              onClick={store.nextSlide}
              disabled={currentSlideIndex >= slides.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div >

          <div className="h-4 w-px bg-border" />

          <Select
            value={theme.id}
            onValueChange={(id) => {
              const newTheme = DEFAULT_THEMES.find(t => t.id === id)
              if (newTheme) store.setTheme(newTheme)
            }}
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_THEMES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: t.primaryColor }}
                    />
                    {t.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div >

        <div className="flex items-center gap-2">
          {currentPresentation && (
            <span className="text-sm text-muted-foreground mr-2 hidden md:inline">
              <FileText className="h-4 w-4 inline mr-1" />
              {currentPresentation.title}
            </span>
          )}

          <div className="flex items-center gap-1">
            <Button
              variant="default"
              size="sm"
              onClick={() => store.setIsFullscreen(true)}
              className="mr-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAIDialog(true)}
              className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              AI
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Insert Content</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
                  <Import className="h-4 w-4 mr-2" />
                  Import from Module...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Templates</DropdownMenuLabel>
                {DEFAULT_TEMPLATES.map(t => (
                  <DropdownMenuItem key={t.id} onClick={() => loadTemplate(t.id)}>
                    <LayoutTemplate className="h-4 w-4 mr-2" />
                    {t.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="h-4 w-px bg-border mx-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                disabled={isExporting || slides.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportPptx}>
                <FileText className="h-4 w-4 mr-2" />
                PowerPoint (.pptx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPdf}>
                <FileText className="h-4 w-4 mr-2" />
                PDF (.pdf)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div >

      <AIGeneratorDialog
        open={showAIDialog}
        onOpenChange={setShowAIDialog}
      />

      <CrossModuleImporter
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={handleImport}
      />
    </>
  )
}
