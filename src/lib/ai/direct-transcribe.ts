/**
 * Direct Audio Transcription (Bypasses Vercel AI SDK)
 * Supports: Google, OpenRouter, OpenAI, Local, Groq
 */

import { useAIStore, type AIModelConfig } from '@/store/aiStore'
import { transcribeWithGoogle } from './adapters/google'
import { transcribeWithOpenRouter } from './adapters/openrouter'
import { transcribeWithOpenAI } from './adapters/openai'
import { transcribeWithGroq } from './adapters/groq'
import { transcribeWithLocal } from './adapters/local'

interface TranscribeConfig {
    base64Audio: string
    modelConfig: AIModelConfig
}

/**
 * Universal audio transcription via direct REST API calls
 * Bypasses Vercel AI SDK schema validation issues
 */
export async function transcribeAudioDirect({ base64Audio, modelConfig }: TranscribeConfig): Promise<string> {
    const { googleApiKey, openaiApiKey, openrouterApiKey } = useAIStore.getState()

    switch (modelConfig.provider) {
        case 'google':
            if (!googleApiKey) throw new Error('Google API Key required')
            return transcribeWithGoogle(base64Audio, googleApiKey, modelConfig.modelId)

        case 'openrouter':
            if (!openrouterApiKey) throw new Error('OpenRouter API Key required')
            return transcribeWithOpenRouter(base64Audio, openrouterApiKey, modelConfig.modelId)

        case 'openai':
            if (!openaiApiKey) throw new Error('OpenAI API Key required')
            return transcribeWithOpenAI(base64Audio, openaiApiKey, modelConfig.modelId)

        case 'groq':
            if (!useAIStore.getState().groqApiKey) throw new Error('Groq API Key required')
            return transcribeWithGroq(base64Audio, useAIStore.getState().groqApiKey, modelConfig.modelId || 'distil-whisper-large-v3-en')

        case 'local':
            if (!modelConfig.baseUrl) throw new Error('Base URL required for local model')
            return transcribeWithLocal(base64Audio, modelConfig.baseUrl, modelConfig.modelId, modelConfig.apiKey)

        default:
            throw new Error(`Unsupported provider: ${modelConfig.provider}`)
    }
}
