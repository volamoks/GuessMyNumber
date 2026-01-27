import { useEffect, useRef } from 'react'
import { usePresentationStore } from '@/store'
import { SlidePreview } from './SlidePreview'
import { cn } from '@/lib/utils'

export function SlideThumbnails() {
  const { slides, currentSlideIndex, setCurrentSlideIndex } = usePresentationStore()

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const activeElement = scrollRef.current.children[currentSlideIndex] as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [currentSlideIndex])

  if (slides.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No slides yet. Start writing markdown to create slides.
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="p-4 space-y-4 overflow-y-auto h-full">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => setCurrentSlideIndex(index)}
          className={cn(
            'group w-full flex items-start gap-3 transition-all outline-none',
            index === currentSlideIndex ? 'opacity-100' : 'opacity-70 hover:opacity-100'
          )}
        >
          <span className={cn(
            "text-xs font-mono pt-1 min-w-[1.5rem] text-right transition-colors",
            index === currentSlideIndex ? "text-primary font-bold" : "text-muted-foreground"
          )}>
            {(index + 1).toString().padStart(2, '0')}
          </span>

          <div className={cn(
            "relative flex-1 rounded-lg overflow-hidden transition-all duration-200",
            index === currentSlideIndex
              ? "ring-2 ring-primary ring-offset-2 shadow-md scale-[1.02]"
              : "ring-1 ring-border hover:ring-primary/50"
          )}>
            <SlidePreview slideIndex={index} showBorder={false} isThumbnail className="pointer-events-none" />
          </div>
        </button>
      ))}
    </div>
  )
}
