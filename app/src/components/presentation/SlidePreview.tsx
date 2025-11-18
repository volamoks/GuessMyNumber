import { useMemo } from 'react'
import { usePresentationStore } from '@/store/presentationStore'
import { markdownToHtml } from '@/lib/markdown-slides'
import { cn } from '@/lib/utils'

interface SlidePreviewProps {
  slideIndex?: number
  className?: string
  showBorder?: boolean
  isThumbnail?: boolean
}

export function SlidePreview({ slideIndex, className, showBorder = true, isThumbnail = false }: SlidePreviewProps) {
  const { slides, currentSlideIndex, theme, markdown, settings } = usePresentationStore()
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

  const getLogoPosition = () => {
    const size = settings.logo.size * 72 // convert inches to px (72 DPI)
    const margin = 16

    switch (settings.logo.position) {
      case 'top-left':
        return { top: margin, left: margin, width: size, height: size }
      case 'top-right':
        return { top: margin, right: margin, width: size, height: size }
      case 'bottom-left':
        return { bottom: margin, left: margin, width: size, height: size }
      case 'bottom-right':
        return { bottom: margin, right: margin, width: size, height: size }
    }
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
      {/* Background Image */}
      {settings.backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${settings.backgroundImage})`,
            opacity: settings.backgroundOpacity / 100,
          }}
        />
      )}

      <div className={cn(
        "absolute inset-0 flex flex-col overflow-auto",
        isThumbnail ? "p-2" : "p-6"
      )}>
        {/* Rendered Markdown with prose styles */}
        <div
          className={cn(
            'prose prose-full',
            isThumbnail ? 'prose-slide' : 'prose-compact'
          )}
          style={{
            '--foreground': theme.textColor,
            '--primary': theme.primaryColor,
            '--muted': theme.backgroundColor === '#ffffff' || theme.backgroundColor === '#fafafa' || theme.backgroundColor === '#f8fafc'
              ? '#f3f4f6'
              : '#374151',
            '--muted-foreground': theme.textColor + '99',
            '--border': theme.textColor + '30',
            '--destructive': theme.primaryColor,
            '--font-mono': theme.codeFontFamily || 'JetBrains Mono, monospace',
            '--card': theme.backgroundColor,
            '--ring': theme.secondaryColor,
            color: theme.textColor,
            fontSize: `${settings.slideStyle.bodyFontSize * (isThumbnail ? 0.5 : 1)}px`,
          } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: slideHtml }}
        />

        {/* Logo */}
        {settings.logo.enabled && settings.logo.url && !isThumbnail && (
          <img
            src={settings.logo.url}
            alt="Logo"
            className="absolute object-contain"
            style={{
              ...getLogoPosition(),
              opacity: settings.logo.opacity / 100,
            }}
          />
        )}

        {/* Slide number */}
        {!isThumbnail && (
          <div className="absolute bottom-2 right-3 text-xs opacity-50">
            {index + 1} / {slides.length}
          </div>
        )}
      </div>
    </div>
  )
}
