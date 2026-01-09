import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark' | 'system'
type ColorScheme = 'default' | 'bubblegum' | 'clean-slate'

interface ThemeStore {
  theme: Theme
  colorScheme: ColorScheme
  setTheme: (theme: Theme) => void
  setColorScheme: (scheme: ColorScheme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      colorScheme: 'default',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme, get().colorScheme)
      },

      setColorScheme: (colorScheme) => {
        set({ colorScheme })
        applyTheme(get().theme, colorScheme)
      },

      toggleTheme: () => {
        const current = get().theme
        const next = current === 'light' ? 'dark' : 'light'
        get().setTheme(next)
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme, state.colorScheme || 'default')
        }
      },
    }
  )
)

function applyTheme(theme: Theme, colorScheme: ColorScheme) {
  const root = window.document.documentElement

  // Remove previous theme classes
  root.classList.remove('light', 'dark', 'theme-bubblegum', 'theme-clean-slate')

  // Apply color scheme
  if (colorScheme !== 'default') {
    root.classList.add(`theme-${colorScheme}`)
  }

  // Apply light/dark mode
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme)
  }
}

// Listen to system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const store = useThemeStore.getState()
    if (store.theme === 'system') {
      applyTheme('system', store.colorScheme)
    }
  })
}
