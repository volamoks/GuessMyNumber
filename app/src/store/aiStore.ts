import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIProvider } from '@/lib/ai-service'

interface AIConfig {
  provider: AIProvider | ''
  apiKey: string
  model: string
  baseUrl: string
}

interface AIStore {
  config: AIConfig
  isConfigured: boolean

  setProvider: (provider: AIProvider) => void
  setApiKey: (apiKey: string) => void
  setModel: (model: string) => void
  setBaseUrl: (baseUrl: string) => void

  saveConfig: () => void
  clearConfig: () => void

  getConfig: () => AIConfig | null
}

export const useAIStore = create<AIStore>()(
  persist(
    (set, get) => ({
      config: {
        provider: '',
        apiKey: '',
        model: '',
        baseUrl: '',
      },
      isConfigured: false,

      setProvider: (provider) =>
        set((state) => ({
          config: { ...state.config, provider },
        })),

      setApiKey: (apiKey) =>
        set((state) => ({
          config: { ...state.config, apiKey },
        })),

      setModel: (model) =>
        set((state) => ({
          config: { ...state.config, model },
        })),

      setBaseUrl: (baseUrl) =>
        set((state) => ({
          config: { ...state.config, baseUrl },
        })),

      saveConfig: () => {
        const { config } = get()
        if (config.provider && config.apiKey) {
          set({ isConfigured: true })
        }
      },

      clearConfig: () =>
        set({
          config: {
            provider: '',
            apiKey: '',
            model: '',
            baseUrl: '',
          },
          isConfigured: false,
        }),

      getConfig: () => {
        const { config } = get()
        if (config.provider && config.apiKey) {
          return config
        }
        return null
      },
    }),
    {
      name: 'ai-config-storage',
    }
  )
)
