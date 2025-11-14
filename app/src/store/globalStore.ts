import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AIProvider } from '@/lib/ai-service-new'
import { setAIConfig, clearAIConfig } from '@/lib/ai-service-new'

// Отдельная конфигурация для каждой модели
export interface AIModelConfig {
  id: string
  name: string // Пользовательское название
  provider: AIProvider
  apiKey: string
  model: string
  baseUrl: string
}

interface GlobalStore {
  // AI Models - список сохраненных моделей
  aiModels: AIModelConfig[]
  activeModelId: string | null // ID активной модели

  // Actions для управления моделями
  addAIModel: (model: Omit<AIModelConfig, 'id'>) => void
  updateAIModel: (id: string, model: Partial<AIModelConfig>) => void
  deleteAIModel: (id: string) => void
  setActiveModel: (id: string) => void
  getActiveModel: () => AIModelConfig | null
}

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set, get) => ({
      // Новая система моделей
      aiModels: [],
      activeModelId: null,

      addAIModel: (model) => {
        const timestamp = Date.now()
        const random = Math.random().toString(36).substr(2, 9)
        const id = `model_${timestamp}_${random}`
        const newModel: AIModelConfig = { ...model, id }

        set((state) => ({
          aiModels: [...state.aiModels, newModel],
          activeModelId: state.activeModelId || id,
        }))

        const currentState = get()
        if (!currentState.activeModelId || currentState.activeModelId === id) {
          setAIConfig({
            provider: model.provider,
            apiKey: model.apiKey,
            model: model.model,
            baseUrl: model.baseUrl,
          })
        }
      },

      updateAIModel: (id, updates) => {
        set((state) => ({
          aiModels: state.aiModels.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }))

        const currentState = get()
        if (currentState.activeModelId === id) {
          const model = currentState.aiModels.find((m) => m.id === id)
          if (model) {
            setAIConfig({
              provider: model.provider,
              apiKey: model.apiKey,
              model: model.model,
              baseUrl: model.baseUrl,
            })
          }
        }
      },

      deleteAIModel: (id) => {
        set((state) => {
          const newModels = state.aiModels.filter((m) => m.id !== id)
          const newActiveId =
            state.activeModelId === id
              ? newModels[0]?.id || null
              : state.activeModelId

          if (newActiveId && newActiveId !== state.activeModelId) {
            const newActiveModel = newModels.find((m) => m.id === newActiveId)
            if (newActiveModel) {
              setAIConfig({
                provider: newActiveModel.provider,
                apiKey: newActiveModel.apiKey,
                model: newActiveModel.model,
                baseUrl: newActiveModel.baseUrl,
              })
            }
          } else if (!newActiveId) {
            clearAIConfig()
          }

          return {
            aiModels: newModels,
            activeModelId: newActiveId,
          }
        })
      },

      setActiveModel: (id) => {
        const model = get().aiModels.find((m) => m.id === id)
        if (!model) return

        set({ activeModelId: id })
        setAIConfig({
          provider: model.provider,
          apiKey: model.apiKey,
          model: model.model,
          baseUrl: model.baseUrl,
        })
      },

      getActiveModel: () => {
        const { aiModels, activeModelId } = get()
        return aiModels.find((m) => m.id === activeModelId) || null
      },
    }),
    {
      name: 'global-storage',
      onRehydrateStorage: () => (state) => {
        // После восстановления из localStorage, инициализируем AI конфигурацию
        if (state?.activeModelId && state?.aiModels) {
          const activeModel = state.aiModels.find((m) => m.id === state.activeModelId)
          if (activeModel) {
            setAIConfig({
              provider: activeModel.provider,
              apiKey: activeModel.apiKey,
              model: activeModel.model,
              baseUrl: activeModel.baseUrl,
            })
          }
        }
      },
    }
  )
)
