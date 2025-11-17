import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Presentation, PresentationTheme, Slide } from '@/lib/presentation-types'
import { DEFAULT_THEMES, SAMPLE_MARKDOWN } from '@/lib/presentation-types'

interface PresentationStore {
  // Current presentation
  currentPresentation: Presentation | null
  markdown: string
  slides: Slide[]
  currentSlideIndex: number

  // Theme
  theme: PresentationTheme

  // UI state
  isEditing: boolean
  isFullscreen: boolean
  isExporting: boolean
  showPreview: boolean

  // Saved presentations
  savedPresentations: Presentation[]

  // Actions
  setMarkdown: (markdown: string) => void
  setSlides: (slides: Slide[]) => void
  setCurrentSlideIndex: (index: number) => void
  nextSlide: () => void
  prevSlide: () => void
  setTheme: (theme: PresentationTheme) => void
  setIsEditing: (isEditing: boolean) => void
  setIsFullscreen: (isFullscreen: boolean) => void
  setIsExporting: (isExporting: boolean) => void
  setShowPreview: (showPreview: boolean) => void

  // Presentation management
  createPresentation: (title: string) => void
  savePresentation: () => void
  loadPresentation: (id: string) => void
  deletePresentation: (id: string) => void

  reset: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

const initialState = {
  currentPresentation: null,
  markdown: SAMPLE_MARKDOWN,
  slides: [],
  currentSlideIndex: 0,
  theme: DEFAULT_THEMES[0],
  isEditing: true,
  isFullscreen: false,
  isExporting: false,
  showPreview: true,
  savedPresentations: [],
}

export const usePresentationStore = create<PresentationStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMarkdown: (markdown: string) => set({ markdown }),
      setSlides: (slides: Slide[]) => set({ slides }),
      setCurrentSlideIndex: (index: number) => set({ currentSlideIndex: index }),

      nextSlide: () => {
        const { currentSlideIndex, slides } = get()
        if (currentSlideIndex < slides.length - 1) {
          set({ currentSlideIndex: currentSlideIndex + 1 })
        }
      },

      prevSlide: () => {
        const { currentSlideIndex } = get()
        if (currentSlideIndex > 0) {
          set({ currentSlideIndex: currentSlideIndex - 1 })
        }
      },

      setTheme: (theme: PresentationTheme) => set({ theme }),
      setIsEditing: (isEditing: boolean) => set({ isEditing }),
      setIsFullscreen: (isFullscreen: boolean) => set({ isFullscreen }),
      setIsExporting: (isExporting: boolean) => set({ isExporting }),
      setShowPreview: (showPreview: boolean) => set({ showPreview }),

      createPresentation: (title: string) => {
        const { markdown, slides, theme } = get()
        const now = new Date()
        const presentation: Presentation = {
          id: generateId(),
          title,
          createdAt: now,
          updatedAt: now,
          slides,
          theme,
          markdown,
        }
        set({ currentPresentation: presentation })
      },

      savePresentation: () => {
        const { currentPresentation, markdown, slides, theme, savedPresentations } = get()
        if (!currentPresentation) return

        const updated: Presentation = {
          ...currentPresentation,
          updatedAt: new Date(),
          slides,
          theme,
          markdown,
        }

        const existing = savedPresentations.findIndex(p => p.id === updated.id)
        let newList: Presentation[]

        if (existing >= 0) {
          newList = [...savedPresentations]
          newList[existing] = updated
        } else {
          newList = [...savedPresentations, updated]
        }

        set({
          currentPresentation: updated,
          savedPresentations: newList,
        })
      },

      loadPresentation: (id: string) => {
        const { savedPresentations } = get()
        const presentation = savedPresentations.find(p => p.id === id)
        if (presentation) {
          set({
            currentPresentation: presentation,
            markdown: presentation.markdown,
            slides: presentation.slides,
            theme: presentation.theme,
            currentSlideIndex: 0,
          })
        }
      },

      deletePresentation: (id: string) => {
        const { savedPresentations, currentPresentation } = get()
        const newList = savedPresentations.filter(p => p.id !== id)
        set({
          savedPresentations: newList,
          currentPresentation: currentPresentation?.id === id ? null : currentPresentation,
        })
      },

      reset: () => set(initialState),
    }),
    {
      name: 'presentation-storage',
      version: 1,
      partialize: (state) => ({
        savedPresentations: state.savedPresentations,
        theme: state.theme,
        markdown: state.markdown,
      }),
    }
  )
)
