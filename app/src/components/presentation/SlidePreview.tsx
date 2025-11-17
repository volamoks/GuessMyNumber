import { usePresentationStore } from '@/store/presentationStore'
import { extractBulletPoints } from '@/lib/markdown-slides'
import { cn } from '@/lib/utils'

interface SlidePreviewProps {
  slideIndex?: number
  className?: string
  showBorder?: boolean
}

export function SlidePreview({ slideIndex, className, showBorder = true }: SlidePreviewProps) {
  const { slides, currentSlideIndex, theme } = usePresentationStore()
  const index = slideIndex ?? currentSlideIndex
  const slide = slides[index]

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
      <div className="absolute inset-0 p-6 flex flex-col">
        {/* Title */}
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: theme.primaryColor }}
        >
          {slide.title}
        </h2>

        {/* Content */}
        <div className="flex-1 overflow-hidden space-y-3">
          {slide.content.map((content, i) => {
            switch (content.type) {
              case 'text':
                return (
                  <p key={i} className="text-sm leading-relaxed">
                    {content.content}
                  </p>
                )

              case 'bullets': {
                const bullets = extractBulletPoints(content.content)
                return (
                  <ul key={i} className="space-y-1.5 text-sm">
                    {bullets.map((bullet, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span
                          className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )
              }

              case 'code':
                return (
                  <pre
                    key={i}
                    className="p-3 rounded text-xs overflow-x-auto"
                    style={{
                      backgroundColor: theme.backgroundColor === '#ffffff' ? '#f7fafc' : '#1e293b',
                      fontFamily: theme.codeFontFamily,
                    }}
                  >
                    <code>{content.content}</code>
                  </pre>
                )

              case 'image':
                return (
                  <div
                    key={i}
                    className="border-2 border-dashed rounded p-4 text-center"
                    style={{ borderColor: theme.primaryColor + '40' }}
                  >
                    <span className="text-xs opacity-60">
                      [Image: {content.options?.alt || 'Image'}]
                    </span>
                  </div>
                )

              default:
                return null
            }
          })}
        </div>

        {/* Slide number */}
        <div className="absolute bottom-2 right-3 text-xs opacity-50">
          {index + 1} / {slides.length}
        </div>
      </div>
    </div>
  )
}
