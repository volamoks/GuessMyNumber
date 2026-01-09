
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AIProvider = 'google' | 'openai' | 'openrouter' | 'local' | 'groq' | 'deepseek'

export interface AIModelConfig {
    id: string
    name: string
    provider: AIProvider
    modelId: string
    baseUrl?: string // For local/custom providers
    apiKey?: string // For custom providers requiring auth
    isEnabled: boolean
}

const DEFAULT_MODELS: AIModelConfig[] = [
    { id: 'default-gemini', name: 'Gemini 1.5 Flash', provider: 'google', modelId: 'gemini-1.5-flash', isEnabled: true },
    { id: 'default-gpt4o', name: 'GPT-4o', provider: 'openai', modelId: 'gpt-4o', isEnabled: true },
    { id: 'default-claude', name: 'Claude 3.5 Sonnet', provider: 'openrouter', modelId: 'anthropic/claude-3.5-sonnet', isEnabled: true },
    { id: 'default-groq-whisper', name: 'Groq Whisper', provider: 'groq', modelId: 'distil-whisper-large-v3-en', isEnabled: true },
    { id: 'default-deepseek', name: 'DeepSeek Chat', provider: 'deepseek', modelId: 'deepseek-chat', isEnabled: true },
]

export type AIFeature = 'default' | 'transcription' | 'chat' | 'analysis'

interface AIState {
    // API Keys (stored locally for "Bring Your Own Key")
    googleApiKey: string
    openaiApiKey: string
    openrouterApiKey: string
    groqApiKey: string
    deepseekApiKey: string

    // Configured Models List
    configuredModels: AIModelConfig[]

    // Feature Assignments (maps Feature -> Config ID)
    models: Record<AIFeature, string>

    // Actions
    setApiKey: (provider: AIProvider, key: string) => void
    setModel: (feature: AIFeature, configId: string) => void
    getApiKey: (provider: AIProvider) => string

    // Model Management Actions
    addModel: (config: Omit<AIModelConfig, 'id'>) => void
    updateModel: (id: string, config: Partial<AIModelConfig>) => void
    deleteModel: (id: string) => void
    getModelConfig: (id: string) => AIModelConfig | undefined
    isAIConfigured: (feature?: AIFeature) => boolean
}

export const useAIStore = create<AIState>()(
    persist(
        (set, get) => ({
            googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY || '',
            openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
            openrouterApiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
            groqApiKey: import.meta.env.VITE_GROQ_API_KEY || '',
            deepseekApiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',

            configuredModels: DEFAULT_MODELS,

            models: {
                default: 'default-gemini',
                transcription: 'default-gemini',
                chat: 'default-gpt4o',
                analysis: 'default-gemini',
            },

            setApiKey: (provider, key) =>
                set((_state) => {
                    if (provider === 'google') return { googleApiKey: key }
                    if (provider === 'openai') return { openaiApiKey: key }
                    if (provider === 'openrouter') return { openrouterApiKey: key }
                    if (provider === 'groq') return { groqApiKey: key }
                    if (provider === 'deepseek') return { deepseekApiKey: key }
                    return {}
                }),

            setModel: (feature, configId) =>
                set((state) => ({
                    models: { ...state.models, [feature]: configId },
                })),

            getApiKey: (provider) => {
                const state = get()
                if (provider === 'google') return state.googleApiKey
                if (provider === 'openai') return state.openaiApiKey
                if (provider === 'openrouter') return state.openrouterApiKey
                if (provider === 'groq') return state.groqApiKey
                if (provider === 'deepseek') return state.deepseekApiKey
                return ''
            },

            addModel: (config) =>
                set((state) => {
                    const newModel = { ...config, id: crypto.randomUUID(), isEnabled: true }
                    return { configuredModels: [...state.configuredModels, newModel] }
                }),

            updateModel: (id, config) =>
                set((state) => ({
                    configuredModels: state.configuredModels.map((m) =>
                        m.id === id ? { ...m, ...config } : m
                    ),
                })),

            deleteModel: (id) =>
                set((state) => ({
                    configuredModels: state.configuredModels.filter((m) => m.id !== id),
                    // Reset assignments if deleted model was used
                    models: Object.fromEntries(
                        Object.entries(state.models).map(([feature, currentId]) => [
                            feature,
                            currentId === id ? state.configuredModels[0]?.id || '' : currentId,
                        ])
                    ) as Record<AIFeature, string>,
                })),

            getModelConfig: (id) => get().configuredModels.find((m) => m.id === id),

            isAIConfigured: (feature = 'default') => {
                const state = get()
                const modelId = state.models[feature]
                const config = state.configuredModels.find(m => m.id === modelId)

                if (!config) return false
                if (!config.isEnabled) return false

                if (config.provider === 'local') return !!config.baseUrl
                if (config.provider === 'google') return !!state.googleApiKey
                if (config.provider === 'openai') return !!state.openaiApiKey
                if (config.provider === 'openrouter') return !!state.openrouterApiKey
                if (config.provider === 'groq') return !!state.groqApiKey
                if (config.provider === 'deepseek') return !!state.deepseekApiKey

                return false
            },
        }),
        {
            name: 'ai-storage',
            partialize: (state) => ({
                googleApiKey: state.googleApiKey,
                openaiApiKey: state.openaiApiKey,
                openrouterApiKey: state.openrouterApiKey,
                groqApiKey: state.groqApiKey,
                deepseekApiKey: state.deepseekApiKey,
                configuredModels: state.configuredModels,
                models: state.models,
            }),
        }
    )
)
