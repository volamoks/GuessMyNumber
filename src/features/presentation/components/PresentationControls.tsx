import { useState } from 'react'
import { supabase } from '@/lib/supabase'

// ... existing imports


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

    // Get title from markdown if current presentation title looks like a UUID or is empty
    const h1Match = markdown.match(/^#\s+(.+)$/m)
    const extractedTitle = h1Match ? h1Match[1].trim() : 'Presentation'

    const currentTitle = currentPresentation?.title || extractedTitle
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentTitle) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentTitle)
    const finalTitle = isUuid ? extractedTitle : currentTitle

    store.setIsExporting(true)
    try {
      await exportToPptx(slides, {
        title: finalTitle,
        author: settings.author || currentPresentation?.author,
        company: settings.company,
        theme: theme,
        slideStyle: settings.slideStyle,
        slideSize: settings.layout,
        logo: settings.logo,
        backgroundImage: settings.backgroundImage,
        backgroundOpacity: settings.backgroundOpacity,
        footer: settings.footer,
        showDate: settings.showDate,
      }, markdown)
      toast.success('Презентация успешно экспортирована!')
    } catch (err) {
      console.error('Export failed:', err)
      toast.error('Ошибка при экспорте презентации')
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

  const handleExportPdf = async () => {
    if (slides.length === 0) {
      toast.error('No slides to export')
      return
    }

    store.setIsExporting(true)
    const toastId = toast.loading('Подготовка PDF...')

    try {
      const { jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      // Create PDF in landscape 16:9
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080],
      })

      // Get title from markdown if current presentation title looks like a UUID or is empty
      const h1Match = markdown.match(/^#\s+(.+)$/m)
      const extractedTitle = h1Match ? h1Match[1].trim() : 'Presentation'

      const currentTitle = currentPresentation?.title || extractedTitle
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentTitle) ||
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentTitle)
      const finalTitle = isUuid ? extractedTitle : currentTitle

      const originalIndex = currentSlideIndex

      for (let i = 0; i < slides.length; i++) {
        toast.loading(`Рендеринг слайда ${i + 1} из ${slides.length}...`, { id: toastId })

        store.setCurrentSlideIndex(i)
        await new Promise(resolve => setTimeout(resolve, 500)) // More time for heavy renders (Mermaid etc)

        const mainPreview = document.querySelector('.flex-1.p-4.flex.items-center.justify-center.overflow-auto .aspect-video')

        if (mainPreview) {
          const canvas = await html2canvas(mainPreview as HTMLElement, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: theme.backgroundColor,
          })

          const imgData = canvas.toDataURL('image/jpeg', 0.95)

          if (i > 0) pdf.addPage()
          pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080)
        }
      }

      // Restore original slide
      store.setCurrentSlideIndex(originalIndex)

      const sanitizedTitle = finalTitle.replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '_') || 'Presentation'
      pdf.save(`${sanitizedTitle}.pdf`)

      toast.success('PDF успешно экспортирован!', { id: toastId })
    } catch (err) {
      console.error('PDF export failed:', err)
      toast.error('Ошибка при экспорте PDF', { id: toastId })
    } finally {
      store.setIsExporting(false)
    }
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
            onClick={async () => {
              let id = currentPresentation?.id

              if (!id) {
                // Returns the ID of the newly created presentation
                id = store.createPresentation('Untitled')
              }

              const toastId = toast.loading('Creating collaboration session...')
              const url = `${window.location.origin}/presentation/${id}`

              // Ensure row exists in Supabase
              try {
                const { error } = await supabase
                  .from('presentations')
                  .upsert({
                    id,
                    title: currentPresentation?.title || 'Untitled Presentation',
                  })

                if (error) {
                  console.error('Supabase error:', error)
                  if (error.code === '42P01') { // undefined_table
                    toast.error('SQL setup missing. Please run setup_supabase.sql', { id: toastId })
                    return
                  }
                  if (error.message && error.message.includes('404')) {
                    toast.error('Database table not found. Run SQL script!', { id: toastId })
                    return
                  }
                }

                await navigator.clipboard.writeText(url)
                toast.success('Link copied! Ready to collaborate.', { id: toastId })

                if (!window.location.pathname.includes(id)) {
                  // Use replaceState to avoid cluttering history, or pushState.
                  // reloading to ensure clean state for simplicity
                  window.location.href = `/presentation/${id}`
                }
              } catch (e) {
                console.error(e)
                toast.error('Failed to create session. Check DB setup.', { id: toastId })
              }
            }}
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
              <DropdownMenuItem onClick={handleExport}>
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
