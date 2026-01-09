
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { useAIStore, type AIFeature, type AIModelConfig } from '@/store/aiStore'
import { generateText } from 'ai'

/**
 * Get the AI Model instance for a specific feature
 * by resolving the configId from the store.
 */
export const getModel = (feature: AIFeature = 'default') => {
    const store = useAIStore.getState()
    const configId = store.models[feature] || store.models.default
    const config = store.configuredModels.find(m => m.id === configId)
        || store.configuredModels[0] // Fallback to first if not found

    if (!config) {
        throw new Error(`No AI model configured for feature: ${feature}`)
    }

    return createModelFromConfig(config)
}

/**
 * Helper to create SDK model from config
 */
function createModelFromConfig(config: AIModelConfig) {
    const store = useAIStore.getState()

    if (config.provider === 'google') {
        const google = createGoogleGenerativeAI({
            apiKey: store.googleApiKey,
        })
        return google(config.modelId)
    }

    if (config.provider === 'openai') {
        const openai = createOpenAI({
            apiKey: store.openaiApiKey,
        })
        return openai.chat(config.modelId)
    }

    if (config.provider === 'openrouter') {
        const openrouter = createOpenAI({
            apiKey: store.openrouterApiKey,
            baseURL: 'https://openrouter.ai/api/v1',
        })
        return openrouter.chat(config.modelId)
    }

    if (config.provider === 'local') {
        const local = createOpenAI({
            apiKey: config.apiKey || 'not-needed',
            baseURL: config.baseUrl || 'http://localhost:1234/v1',
        })
        return local.chat(config.modelId)
    }

    if (config.provider === 'deepseek') {
        const deepseek = createOpenAI({
            apiKey: store.deepseekApiKey,
            baseURL: 'https://api.deepseek.com',
        })
        return deepseek.chat(config.modelId)
    }

    throw new Error(`Unknown provider: ${config.provider}`)
}

/**
 * Check connection for a specific model config
 * Returns true if successful, throws error if failed
 */
export async function checkConnection(config: AIModelConfig): Promise<boolean> {
    try {
        const model = createModelFromConfig(config)
        // Generate a very short token to test auth and model availability
        await generateText({
            model,
            prompt: 'ping',
            // maxTokens: 1,
        })
        return true
    } catch (e) {
        console.error('Connection check failed', e)
        throw e
    }
}
