import { usePresentationStore } from '@/store/presentationStore'
import { SlidePreview } from './SlidePreview'
import { cn } from '@/lib/utils'

export function SlideThumbnails() {
  const { slides, currentSlideIndex, setCurrentSlideIndex } = usePresentationStore()

  if (slides.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No slides yet. Start writing markdown to create slides.
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3 overflow-y-auto">
      {slides.map((slide, index) => (
        <button
          key={slide.id}
          onClick={() => setCurrentSlideIndex(index)}
          className={cn(
            'w-full transition-all',
            'hover:ring-2 hover:ring-primary/50 rounded-lg',
            index === currentSlideIndex && 'ring-2 ring-primary'
          )}
        >
          <div className="relative">
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              {index + 1}
            </div>
            <SlidePreview slideIndex={index} showBorder={false} isThumbnail className="pointer-events-none" />
          </div>
        </button>
      ))}
    </div>
  )
}
