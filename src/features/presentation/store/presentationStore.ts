import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Presentation, PresentationTheme, Slide, PresentationSettings } from '@/features/presentation/types'
import { DEFAULT_THEMES, SAMPLE_MARKDOWN } from '@/features/presentation/types'
import type { SlideStyle } from '@/features/presentation/core/types/theme'
import { DEFAULT_SLIDE_STYLE } from '@/features/presentation/core/types/theme'
import type { LogoSettings } from '@/features/presentation/core/types/export'

interface PresentationStore {
  // Current presentation
  currentPresentation: Presentation | null
  markdown: string
  slides: Slide[]
  currentSlideIndex: number

  // Theme
  theme: PresentationTheme

  // Settings
  settings: PresentationSettings

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
  setSettings: (settings: Partial<PresentationSettings>) => void
  updateSlideStyle: (style: Partial<SlideStyle>) => void
  updateLogo: (logo: Partial<LogoSettings>) => void
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

const DEFAULT_SETTINGS: PresentationSettings = {
  layout: 'LAYOUT_16x9',
  fontFamily: 'Inter, sans-serif',
  slideStyle: DEFAULT_SLIDE_STYLE,
  logo: {
    enabled: false,
    url: '',
    position: 'bottom-right',
    size: 1.0,
    opacity: 100,
  },
  backgroundOpacity: 100,
  footer: '',
  showDate: true,
  dateFormat: 'locale',
  datePosition: 'bottom-left',
}

const initialState = {
  currentPresentation: null,
  markdown: SAMPLE_MARKDOWN,
  slides: [],
  currentSlideIndex: 0,
  theme: DEFAULT_THEMES[0],
  settings: DEFAULT_SETTINGS,
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

      setSettings: (newSettings: Partial<PresentationSettings>) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      updateSlideStyle: (style: Partial<SlideStyle>) =>
        set((state) => ({
          settings: {
            ...state.settings,
            slideStyle: { ...state.settings.slideStyle, ...style },
          },
        })),

      updateLogo: (logo: Partial<LogoSettings>) =>
        set((state) => ({
          settings: {
            ...state.settings,
            logo: { ...state.settings.logo, ...logo },
          },
        })),

      setIsEditing: (isEditing: boolean) => set({ isEditing }),
      setIsFullscreen: (isFullscreen: boolean) => set({ isFullscreen }),
      setIsExporting: (isExporting: boolean) => set({ isExporting }),
      setShowPreview: (showPreview: boolean) => set({ showPreview }),

      createPresentation: (title: string) => {
        const { markdown, slides, theme, settings } = get()
        const now = new Date()
        const presentation: Presentation = {
          id: generateId(),
          title,
          createdAt: now,
          updatedAt: now,
          slides,
          theme,
          markdown,
          settings,
        }
        set({ currentPresentation: presentation })
      },

      savePresentation: () => {
        const { currentPresentation, markdown, slides, theme, settings, savedPresentations } = get()
        if (!currentPresentation) return

        const updated: Presentation = {
          ...currentPresentation,
          updatedAt: new Date(),
          slides,
          theme,
          markdown,
          settings,
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
            settings: presentation.settings || DEFAULT_SETTINGS,
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
        settings: state.settings,
        markdown: state.markdown,
      }),
    }
  )
)
