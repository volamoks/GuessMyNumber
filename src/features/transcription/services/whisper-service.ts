/**
 * Whisper Transcription Service
 * Supports Groq (free) and OpenAI Whisper APIs
 */

import type { TranscriptionResult, WhisperConfig } from '../types'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/transcriptions'

const GROQ_MODEL = 'whisper-large-v3'
const OPENAI_MODEL = 'whisper-1'

// Supported audio formats
export const SUPPORTED_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/webm', 'audio/x-m4a']
export const SUPPORTED_EXTENSIONS = ['.mp3', '.mp4', '.m4a', '.wav', '.webm']
export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB (Groq/OpenAI limit)

export class WhisperService {
    private config: WhisperConfig

    constructor(config: WhisperConfig) {
        this.config = config
    }

    /**
     * Transcribe audio file
     */
    async transcribe(file: File, language: string = 'ru'): Promise<TranscriptionResult> {
        if (!this.config.apiKey) {
            throw new Error('API key is required. Please set Groq API key in settings.')
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('model', this.getModel())
        formData.append('language', language)
        formData.append('response_format', 'verbose_json')

        const apiUrl = this.getApiUrl()

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: formData,
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
                throw new Error(error.error?.message || `API error: ${response.status}`)
            }

            const data = await response.json()

            return {
                text: data.text,
                duration: data.duration,
                language: data.language,
                segments: data.segments?.map((seg: { id: number; start: number; end: number; text: string }) => ({
                    id: seg.id,
                    start: seg.start,
                    end: seg.end,
                    text: seg.text,
                })),
            }
        } catch (error) {
            if (error instanceof Error) {
                throw error
            }
            throw new Error('Failed to transcribe audio')
        }
    }

    private getApiUrl(): string {
        return this.config.provider === 'groq' ? GROQ_API_URL : OPENAI_API_URL
    }

    private getModel(): string {
        if (this.config.model) {
            return this.config.model
        }
        return this.config.provider === 'groq' ? GROQ_MODEL : OPENAI_MODEL
    }
}

/**
 * Create whisper service from settings
 */
export function createWhisperService(): WhisperService | null {
    // Check for Groq API key in window settings (same pattern as AI service)
    const groqKey = (window as { __GROQ_API_KEY__?: string }).__GROQ_API_KEY__

    if (groqKey) {
        return new WhisperService({
            apiKey: groqKey,
            provider: 'groq',
            language: 'ru',
        })
    }

    // Fallback to OpenAI if configured
    const openaiKey = (window as { __OPENAI_API_KEY__?: string }).__OPENAI_API_KEY__

    if (openaiKey) {
        return new WhisperService({
            apiKey: openaiKey,
            provider: 'openai',
            language: 'ru',
        })
    }

    return null
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    const isValidType = SUPPORTED_FORMATS.some(format =>
        file.type === format || file.type.startsWith('audio/')
    )

    const hasValidExtension = SUPPORTED_EXTENSIONS.some(ext =>
        file.name.toLowerCase().endsWith(ext)
    )

    if (!isValidType && !hasValidExtension) {
        return {
            valid: false,
            error: `Unsupported format. Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`
        }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB`
        }
    }

    return { valid: true }
}
