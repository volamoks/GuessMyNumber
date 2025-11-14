/**
 * Refactored AI Service
 * Unified AI operations using generic functions and prompt store
 */

import { BaseService } from './services/base-service'
import type { OperationType, Language } from './services/ai-prompts'
import { promptLogsService } from './prompt-logs-service'
import { z } from 'zod'

// Re-export types for convenience
export type { OperationType, Language }

/**
 * AI Provider types
 */
export type AIProvider = 'claude' | 'gemini' | 'openrouter' | 'openai' | 'deepseek'

/**
 * AI Configuration Schema
 */
export const AIConfigSchema = z.object({
  provider: z.enum(['claude', 'gemini', 'openrouter', 'openai', 'deepseek']),
  apiKey: z.string().min(1, 'API key is required'),
  model: z.string().optional(),
  baseUrl: z.string().url().optional(),
})

export type AIConfig = z.infer<typeof AIConfigSchema>

/**
 * AI Service Class
 * Handles all AI operations with unified interface
 */
export class AIService extends BaseService {
  private static instance: AIService

  private constructor() {
    super({ enableLogging: true, throwOnError: true })
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * Get AI configuration from window object
   */
  private getConfig(): AIConfig | null {
    if (typeof window !== 'undefined' && (window as any).__aiConfig) {
      const config = (window as any).__aiConfig

      // Validate config
      const result = AIConfigSchema.safeParse(config)
      if (result.success) {
        return result.data
      }

      this.logError('Invalid AI config', result.error)
    }
    return null
  }

  /**
   * Call AI with prompt and logging
   */
  private async callAI(
    prompt: string,
    config: AIConfig,
    operation: OperationType,
    projectId?: string
  ): Promise<string> {
    this.log(`Calling AI for operation: ${operation}`)

    try {
      const response = await this.makeProviderRequest(prompt, config)

      // Log the prompt/response
      await promptLogsService.createLog({
        operation_type: operation,
        prompt: prompt,
        response: response,
        model_provider: config.provider,
        model_name: config.model,
        project_id: projectId,
      })

      return response
    } catch (err) {
      throw this.handleError(`AI call failed for ${operation}`, err)
    }
  }

  /**
   * Make request to AI provider
   */
  private async makeProviderRequest(prompt: string, config: AIConfig): Promise<string> {
    const { provider, apiKey, model, baseUrl } = config

    switch (provider) {
      case 'claude':
        return this.callClaude(prompt, apiKey, model || 'claude-3-5-sonnet-20241022', baseUrl)

      case 'gemini':
        return this.callGemini(prompt, apiKey, model || 'gemini-2.0-flash-exp', baseUrl)

      case 'openrouter':
        return this.callOpenRouter(prompt, apiKey, model || 'anthropic/claude-3.5-sonnet', baseUrl)

      case 'openai':
        return this.callOpenAI(prompt, apiKey, model || 'gpt-4o', baseUrl)

      case 'deepseek':
        return this.callDeepSeek(prompt, apiKey, model || 'deepseek-chat', baseUrl)

      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  /**
   * Call Claude API
   */
  private async callClaude(
    prompt: string,
    apiKey: string,
    model: string,
    baseUrl?: string
  ): Promise<string> {
    const url = baseUrl || 'https://api.anthropic.com/v1/messages'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 16000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Claude API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  /**
   * Call Gemini API
   */
  private async callGemini(
    prompt: string,
    apiKey: string,
    model: string,
    baseUrl?: string
  ): Promise<string> {
    const url =
      baseUrl || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

    const response = await fetch(`${url}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  /**
   * Call OpenRouter API
   */
  private async callOpenRouter(
    prompt: string,
    apiKey: string,
    model: string,
    baseUrl?: string
  ): Promise<string> {
    const url = baseUrl || 'https://openrouter.ai/api/v1/chat/completions'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    prompt: string,
    apiKey: string,
    model: string,
    baseUrl?: string
  ): Promise<string> {
    const url = baseUrl || 'https://api.openai.com/v1/chat/completions'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  /**
   * Call DeepSeek API
   */
  private async callDeepSeek(
    prompt: string,
    apiKey: string,
    model: string,
    baseUrl?: string
  ): Promise<string> {
    const url = baseUrl || 'https://api.deepseek.com/v1/chat/completions'

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepSeek API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  /**
   * Parse JSON response from AI
   * Handles markdown code blocks and extracts JSON
   */
  private parseAIJSON<T>(response: string): T {
    let jsonText = response.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    return this.parseJSON<T>(jsonText)
  }

  /**
   * Generic generate function
   */
  async generate<T>(
    operation: OperationType,
    description: string,
    language: Language = 'ru',
    projectId?: string,
    getPrompt?: (operation: OperationType, language: Language, params: Record<string, string>) => string
  ): Promise<T> {
    const config = this.getConfig()
    if (!config) {
      throw new Error('AI не настроен. Пожалуйста, добавьте AI модель в настройках.')
    }

    // Get prompt from provided function or use default
    const prompt = getPrompt
      ? getPrompt(operation, language, { description })
      : description

    const response = await this.callAI(prompt, config, operation, projectId)
    return this.parseAIJSON<T>(response)
  }

  /**
   * Generic analyze function
   */
  async analyze(
    operation: OperationType,
    data: unknown,
    language: Language = 'ru',
    projectId?: string,
    getPrompt?: (operation: OperationType, language: Language, params: Record<string, string>) => string
  ): Promise<string> {
    const config = this.getConfig()
    if (!config) {
      throw new Error('AI не настроен. Пожалуйста, добавьте AI модель в настройках.')
    }

    const dataString = JSON.stringify(data, null, 2)

    const prompt = getPrompt
      ? getPrompt(operation, language, { data: dataString })
      : `Analyze this data:\n${dataString}`

    return this.callAI(prompt, config, operation, projectId)
  }

  /**
   * Generic improve function
   */
  async improve<T>(
    operation: OperationType,
    data: unknown,
    analysis: string,
    language: Language = 'ru',
    projectId?: string,
    getPrompt?: (operation: OperationType, language: Language, params: Record<string, string>) => string
  ): Promise<T> {
    const config = this.getConfig()
    if (!config) {
      throw new Error('AI не настроен. Пожалуйста, добавьте AI модель в настройках.')
    }

    const dataString = JSON.stringify(data, null, 2)

    const prompt = getPrompt
      ? getPrompt(operation, language, { data: dataString, analysis })
      : `Improve this data based on analysis:\n${dataString}\n\nAnalysis:\n${analysis}`

    const response = await this.callAI(prompt, config, operation, projectId)
    return this.parseAIJSON<T>(response)
  }
}

/**
 * Singleton instance export
 */
export const aiService = AIService.getInstance()

/**
 * Set AI configuration globally
 * Used by globalStore to sync active model config
 */
export function setAIConfig(config: AIConfig): void {
  if (typeof window !== 'undefined') {
    (window as any).__aiConfig = config
  }
}

/**
 * Clear AI configuration
 */
export function clearAIConfig(): void {
  if (typeof window !== 'undefined') {
    delete (window as any).__aiConfig
  }
}
