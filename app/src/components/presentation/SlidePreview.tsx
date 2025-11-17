import { useMemo } from 'react'
import { usePresentationStore } from '@/store/presentationStore'
import { markdownToHtml } from '@/lib/markdown-slides'
import { cn } from '@/lib/utils'

interface SlidePreviewProps {
  slideIndex?: number
  className?: string
  showBorder?: boolean
}

export function SlidePreview({ slideIndex, className, showBorder = true }: SlidePreviewProps) {
  const { slides, currentSlideIndex, theme, markdown } = usePresentationStore()
  const index = slideIndex ?? currentSlideIndex
  const slide = slides[index]

  // Получаем markdown для текущего слайда
  const slideMarkdown = useMemo(() => {
    const slideTexts = markdown.split(/\n---\n/).map(s => s.trim()).filter(Boolean)
    return slideTexts[index] || ''
  }, [markdown, index])

  // Конвертируем в HTML
  const slideHtml = useMemo(() => {
    if (!slideMarkdown) return ''
    return markdownToHtml(slideMarkdown)
  }, [slideMarkdown])

  if (!slide) {
    return (
      <div className={cn(
        'aspect-video bg-muted/50 rounded-lg flex items-center justify-center',
        showBorder && 'border',
        className
      )}>
        <p className="text-muted-foreground">No slide to display</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'aspect-video rounded-lg overflow-hidden relative',
        showBorder && 'border shadow-sm',
        className
      )}
      style={{
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="absolute inset-0 p-6 flex flex-col overflow-auto">
        {/* Rendered Markdown with prose styles */}
        <div
          className="prose prose-compact prose-full"
          style={{
            '--foreground': theme.textColor,
            '--primary': theme.primaryColor,
            '--muted': theme.backgroundColor === '#ffffff' ? '#f3f4f6' : '#374151',
            '--muted-foreground': theme.textColor + '99',
            '--border': theme.textColor + '20',
            '--destructive': theme.primaryColor,
            color: theme.textColor,
          } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: slideHtml }}
        />

        {/* Slide number */}
        <div className="absolute bottom-2 right-3 text-xs opacity-50">
          {index + 1} / {slides.length}
        </div>
      </div>
    </div>
  )
}
