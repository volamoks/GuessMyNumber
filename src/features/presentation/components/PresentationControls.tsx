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
import { Download, ChevronLeft, ChevronRight, Save, FileText, Wand2, LayoutTemplate, Import, MoreHorizontal } from 'lucide-react'
import { usePresentationStore } from '@/store'
import { DEFAULT_THEMES, DEFAULT_TEMPLATES } from '@/features/presentation/types'
import { exportToPptx } from '@/features/presentation/services/pptx-export'
import { toast } from 'sonner'
import { AIGeneratorDialog } from './AIGeneratorDialog'
import { CrossModuleImporter } from '@/components/shared/CrossModuleImporter'

export function PresentationControls() {
  const store = usePresentationStore()
  const { slides, currentSlideIndex, theme, isExporting, currentPresentation, markdown, settings } = store
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)

  const handleExport = async () => {
    if (slides.length === 0) {
      toast.error('No slides to export')
      return
    }

    store.setIsExporting(true)
    try {
      await exportToPptx(slides, {
        title: currentPresentation?.title || 'Presentation',
        author: settings.author || currentPresentation?.author,
        company: settings.company,
        theme: theme, // Don't override fontFamily for now
        slideStyle: settings.slideStyle,
        slideSize: settings.layout,
        logo: settings.logo,
        backgroundImage: settings.backgroundImage,
        backgroundOpacity: settings.backgroundOpacity,
        footer: settings.footer,
        showDate: settings.showDate,
      }, markdown)
      toast.success('Presentation exported successfully!')
    } catch (err) {
      console.error('Export failed:', err)
      toast.error('Failed to export presentation')
    } finally {
      store.setIsExporting(false)
    }
  }

  const handleSave = () => {
    if (!currentPresentation) {
      const title = prompt('Enter presentation title:')
      if (title) {
        store.createPresentation(title)
        store.savePresentation()
        toast.success('Presentation saved!')
      }
    } else {
      store.savePresentation()
      toast.success('Presentation saved!')
    }
  }

  const loadTemplate = (templateId: string) => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === templateId)
    if (template) {
      if (confirm('This will replace your current content. Continue?')) {
        store.setMarkdown(template.content)
        toast.success(`Loaded template: ${template.name}`)
      }
    }
  }

  const handleImport = (importedMarkdown: string) => {
    // Append to existing markdown
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
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={store.nextSlide}
              disabled={currentSlideIndex >= slides.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

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
        </div>

        <div className="flex items-center gap-2">
          {currentPresentation && (
            <span className="text-sm text-muted-foreground mr-2 hidden md:inline">
              <FileText className="h-4 w-4 inline mr-1" />
              {currentPresentation.title}
            </span>
          )}

          <div className="flex items-center gap-1">
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
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button
            onClick={handleExport}
            size="sm"
            disabled={isExporting || slides.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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
