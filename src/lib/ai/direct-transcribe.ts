/**
 * Direct Audio Transcription (Bypasses Vercel AI SDK)
 * Supports: Google, OpenRouter, OpenAI, Local
 */

import { useAIStore, type AIModelConfig } from '@/store/aiStore'

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

// --- Provider-specific implementations ---

async function transcribeWithGoogle(base64Audio: string, apiKey: string, model: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const payload = {
        contents: [{
            parts: [
                { inline_data: { mime_type: "audio/webm", data: base64Audio } },
                { text: "Transcribe this audio. Identify speakers as 'Speaker 1', 'Speaker 2', etc. Return only the transcript." }
            ]
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Google API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

async function transcribeWithOpenRouter(base64Audio: string, apiKey: string, model: string): Promise<string> {
    const url = 'https://openrouter.ai/api/v1/chat/completions'

    // OpenRouter uses OpenAI-compatible format
    const payload = {
        model,
        messages: [{
            role: 'user',
            content: [
                { type: 'text', text: "Transcribe this audio. Identify speakers as 'Speaker 1', 'Speaker 2', etc. Return only the transcript." },
                { type: 'image_url', image_url: { url: `data:audio/webm;base64,${base64Audio}` } }
            ]
        }],
        max_tokens: 8192
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Product Tools'
        },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenRouter API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
}

async function transcribeWithOpenAI(base64Audio: string, apiKey: string, model: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions'

    // OpenAI audio support (for gpt-4o-audio-preview, etc.)
    const payload = {
        model,
        messages: [{
            role: 'user',
            content: [
                { type: 'text', text: "Transcribe this audio. Identify speakers as 'Speaker 1', 'Speaker 2', etc. Return only the transcript." },
                { type: 'input_audio', input_audio: { data: base64Audio, format: 'webm' } }
            ]
        }],
        max_tokens: 8192
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
}

async function transcribeWithLocal(base64Audio: string, baseUrl: string, model: string, apiKey?: string): Promise<string> {
    const isWhisper = model.toLowerCase().includes('whisper')

    // Detect if we should use the Audio Transcription API (Multipart) or Chat Completions (Multimodal)
    const endpoint = isWhisper ? '/audio/transcriptions' : '/chat/completions'
    // Normalize URL: remove trailing slash from baseUrl if present
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '')
    // Construct full URL. Note: Some users might provide full path in baseUrl, but usually it's just the root v1.
    // If the user provided a full path ending in v1, we append correctly.
    const url = `${cleanBaseUrl}${endpoint}`

    const headers: Record<string, string> = {}
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
    }

    if (isWhisper) {
        // --- Audio Transcription API (Multipart) ---
        const byteCharacters = atob(base64Audio)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'audio/webm' })
        const file = new File([blob], 'recording.webm', { type: 'audio/webm' })

        const formData = new FormData()
        formData.append('file', file)
        formData.append('model', model)
        formData.append('response_format', 'verbose_json')

        const response = await fetch(url, {
            method: 'POST',
            headers, // Content-Type is auto-set
            body: formData
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Local API Error (${endpoint}): ${response.status} - ${error}`)
        }

        const data = await response.json()

        // Format segments with newlines to simulating meaningful breaks/paragraphs
        if (data.segments && Array.isArray(data.segments)) {
            return data.segments.map((s: any) => s.text.trim()).join('\n\n')
        }

        return data.text || ''

    } else {
        // --- Chat Completions API (Multimodal Hack) ---
        // Warning: sending audio as image_url or input_audio depends on provider support.
        // Defaulting to "image hack" used by some, but strictly this is fragile for "Universal".
        // Better implementation might be needed for generic Llama 3 audio.

        headers['Content-Type'] = 'application/json'

        const payload = {
            model,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: "Transcribe this audio. Return only the transcript." },
                    { type: 'image_url', image_url: { url: `data:audio/webm;base64,${base64Audio}` } }
                ]
            }],
            max_tokens: 4096
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Local API Error (${endpoint}): ${response.status} - ${error}`)
        }

        const data = await response.json()
        return data.choices?.[0]?.message?.content || ''
    }
}


// --- Helpers ---

async function transcribeWithGroq(base64Audio: string, apiKey: string, model: string): Promise<string> {
    const url = 'https://api.groq.com/openai/v1/audio/transcriptions'

    // Convert Base64 to Blob
    const byteCharacters = atob(base64Audio)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'audio/webm' })
    const file = new File([blob], 'recording.webm', { type: 'audio/webm' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', model) // e.g. distil-whisper-large-v3-en
    formData.append('response_format', 'verbose_json')
    formData.append('prompt', 'Transcribe this audio.')

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
            // Content-Type is auto-set with boundary by fetch for FormData
        },
        body: formData
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Groq API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    // Format segments with newlines to simulating meaningful breaks/paragraphs
    if (data.segments && Array.isArray(data.segments)) {
        return data.segments.map((s: any) => s.text.trim()).join('\n\n')
    }

    return data.text || ''
}
