import { useMemo } from 'react'
import { usePresentationStore } from '@/store'
import { markdownToHtml } from '@/features/presentation/utils/markdown-slides'
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

  const formatDate = () => {
    const date = new Date()
    switch (settings.dateFormat) {
      case 'ISO': return date.toISOString().split('T')[0]
      case 'US': return date.toLocaleDateString('en-US')
      case 'EU': return date.toLocaleDateString('en-GB').replace(/\//g, '.')
      default: return date.toLocaleDateString()
    }
  }

  const getDatePosition = () => {
    const margin = 16
    switch (settings.datePosition) {
      case 'top-left': return { top: margin, left: margin }
      case 'top-right': return { top: margin, right: margin }
      case 'bottom-right': return { bottom: margin, right: margin }
      default: return { bottom: margin, left: margin } // bottom-left
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
        fontFamily: settings.fontFamily || theme.fontFamily,
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
            isThumbnail ? 'prose-slide' : 'prose-compact',
            // Force theme colors
            '[&_h1]:!text-[var(--primary)]',
            '[&_h2]:!text-[var(--primary)]',
            '[&_h3]:!text-[var(--primary)]',
            '[&_h4]:!text-[var(--primary)]',
            '[&_a]:!text-[var(--primary)]',
            '[&_strong]:!text-[var(--foreground)]',
            '[&_code]:!text-[var(--primary)]',
            '[&_blockquote]:!border-l-[var(--primary)]',
            '[&_li::marker]:!text-[var(--primary)]'
          )}
          style={{
            '--foreground': theme.textColor,
            '--background': theme.backgroundColor,
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

            // Prose overrides
            '--tw-prose-body': theme.textColor,
            '--tw-prose-headings': theme.primaryColor,
            '--tw-prose-links': theme.primaryColor,
            '--tw-prose-bold': theme.textColor,
            '--tw-prose-counters': theme.textColor,
            '--tw-prose-bullets': theme.textColor,
            '--tw-prose-hr': theme.textColor + '40',
            '--tw-prose-quotes': theme.textColor,
            '--tw-prose-quote-borders': theme.primaryColor,
            '--tw-prose-captions': theme.textColor + '80',
            '--tw-prose-code': theme.primaryColor,
            '--tw-prose-pre-code': theme.textColor,
            '--tw-prose-pre-bg': theme.backgroundColor === '#ffffff' ? '#f3f4f6' : '#1f2937',
            '--tw-prose-th-borders': theme.textColor + '40',
            '--tw-prose-td-borders': theme.textColor + '40',

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

        {/* Date */}
        {settings.showDate && !isThumbnail && (
          <div
            className="absolute text-[10px] opacity-50 pointer-events-none select-none"
            style={getDatePosition()}
          >
            {formatDate()}
          </div>
        )}

        {/* Footer Elements */}
        {!isThumbnail && (
          <div className="absolute bottom-2 left-4 right-4 flex items-end justify-between text-[10px] opacity-50 pointer-events-none select-none">
            <div className="flex gap-4">
              {settings.footer && <span>{settings.footer}</span>}
            </div>
            <div>
              {index + 1} / {slides.length}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
