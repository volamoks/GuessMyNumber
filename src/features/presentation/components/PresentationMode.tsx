import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePresentationStore } from '@/store'
import { SlidePreview } from './SlidePreview'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PresentationMode() {
    const {
        isFullscreen,
        setIsFullscreen,
        slides,
        currentSlideIndex,
        nextSlide,
        prevSlide,
    } = usePresentationStore()

    // Auto-hide controls
    const [showControls, setShowControls] = useState(false)

    useEffect(() => {
        if (!isFullscreen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                case 'Space':
                case 'Enter':
                    e.preventDefault()
                    nextSlide()
                    break
                case 'ArrowLeft':
                case 'Backspace':
                    e.preventDefault()
                    prevSlide()
                    break
                case 'Escape':
                    e.preventDefault()
                    setIsFullscreen(false)
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isFullscreen, nextSlide, prevSlide, setIsFullscreen])

    // Toggle fullscreen API
    useEffect(() => {
        if (isFullscreen) {
            document.documentElement.requestFullscreen().catch(() => { })
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => { })
            }
        }
    }, [isFullscreen])

    // Sync with native fullscreen change (e.g. user presses Esc)
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                setIsFullscreen(false)
            }
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [setIsFullscreen])


    if (!isFullscreen) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[100] bg-black flex flex-col"
            onMouseMove={() => {
                setShowControls(true)
                const timer = setTimeout(() => setShowControls(false), 3000)
                return () => clearTimeout(timer)
            }}
        >
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
                {/* Helper: Scale slide to fit screen while maintaining aspect ratio */}
                <div className="w-full h-full max-w-screen-xl max-h-screen p-4 flex items-center justify-center">
                    <div key={currentSlideIndex} className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in-95 duration-300">
                        <SlidePreview
                            showBorder={false}
                            className="w-full h-full shadow-2xl"
                        // We let CSS aspect-ratio handle the shape in SlidePreview, 
                        // but here we want it to contain within the viewport.
                        />
                    </div>
                </div>

                {/* Hover Controls */}
                <div
                    className={cn(
                        "absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-sm p-2 rounded-full border border-white/10 transition-opacity duration-300",
                        showControls ? "opacity-100" : "opacity-0"
                    )}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={prevSlide}
                        disabled={currentSlideIndex === 0}
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <span className="text-white/80 text-sm font-medium tabular-nums min-w-[3rem] text-center">
                        {currentSlideIndex + 1} / {slides.length}
                    </span>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={nextSlide}
                        disabled={currentSlideIndex === slides.length - 1}
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>

                    <div className="w-px h-6 bg-white/20 mx-2" />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <Minimize2 className="h-5 w-5" />
                    </Button>
                </div>

                {/* Top Right Close */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 transition-opacity duration-300 z-10",
                        showControls ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => setIsFullscreen(false)}
                >
                    <X className="h-6 w-6" />
                </Button>

            </div>
        </div>,
        document.body
    )
}
