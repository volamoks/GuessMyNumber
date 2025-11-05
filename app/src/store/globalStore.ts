import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIProvider } from '@/lib/ai-service'
import * as aiService from '@/lib/ai-service'

interface GlobalStore {
  // AI Config
  ai: {
    provider: AIProvider | ''
    apiKey: string
    model: string
    baseUrl: string
    isConfigured: boolean
  }

  // Actions
  setAIProvider: (provider: AIProvider | '') => void
  setAIKey: (key: string) => void
  setAIModel: (model: string) => void
  setAIBaseUrl: (url: string) => void
  saveAIConfig: () => void
  clearAIConfig: () => void
}

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set, get) => ({
      ai: {
        provider: '',
        apiKey: '',
        model: '',
        baseUrl: '',
        isConfigured: false,
      },

      setAIProvider: (provider) =>
        set((state) => ({
          ai: { ...state.ai, provider },
        })),

      setAIKey: (apiKey) =>
        set((state) => ({
          ai: { ...state.ai, apiKey },
        })),

      setAIModel: (model) =>
        set((state) => ({
          ai: { ...state.ai, model },
        })),

      setAIBaseUrl: (baseUrl) =>
        set((state) => ({
          ai: { ...state.ai, baseUrl },
        })),

      saveAIConfig: () => {
        const { ai } = get()
        if (ai.provider && ai.apiKey) {
          aiService.setAIConfig({
            provider: ai.provider as AIProvider,
            apiKey: ai.apiKey,
            model: ai.model,
            baseUrl: ai.baseUrl,
          })
          set((state) => ({
            ai: { ...state.ai, isConfigured: true },
          }))
        }
      },

      clearAIConfig: () => {
        aiService.clearAIConfig()
        set({
          ai: {
            provider: '',
            apiKey: '',
            model: '',
            baseUrl: '',
            isConfigured: false,
          },
        })
      },
    }),
    {
      name: 'global-storage',
    }
  )
)
