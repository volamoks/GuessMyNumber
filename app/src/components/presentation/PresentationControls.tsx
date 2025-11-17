import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, ChevronLeft, ChevronRight, Save, FileText } from 'lucide-react'
import { usePresentationStore } from '@/store/presentationStore'
import { DEFAULT_THEMES } from '@/lib/presentation-types'
import { exportToPptx } from '@/lib/pptx-export'
import { toast } from 'sonner'

export function PresentationControls() {
  const store = usePresentationStore()
  const { slides, currentSlideIndex, theme, isExporting, currentPresentation } = store

  const handleExport = async () => {
    if (slides.length === 0) {
      toast.error('No slides to export')
      return
    }

    store.setIsExporting(true)
    try {
      await exportToPptx(slides, {
        title: currentPresentation?.title || 'Presentation',
        author: currentPresentation?.author,
        theme,
      })
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

  return (
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
          <span className="text-sm text-muted-foreground mr-2">
            <FileText className="h-4 w-4 inline mr-1" />
            {currentPresentation.title}
          </span>
        )}

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
          {isExporting ? 'Exporting...' : 'Export PPTX'}
        </Button>
      </div>
    </div>
  )
}
