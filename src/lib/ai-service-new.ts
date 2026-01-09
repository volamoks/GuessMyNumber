
/**
 * Unified AI Service Wrapper
 * Replaces the old implementation with the new Vercel AI SDK integration.
 * Maintains the existing API surface for backward compatibility.
 */

import { generateText } from 'ai'
import { getModel } from './ai/vercel-ai'
import type { OperationType, Language } from './services/ai-prompts'

export type AIProvider = 'google' | 'openai' | 'claude' | 'openrouter' | 'deepseek' | 'groq'

export function setAIConfig(_config: any): void {
  // No-op or deprecated
  console.warn('setAIConfig is deprecated. Use useAIStore instead.')
}

export function clearAIConfig(): void {
  // No-op
}

export class AIService {
  private static instance: AIService

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  /**
   * Generic generate function - Routes to Vercel AI SDK
   */
  async generate<T>(
    operation: OperationType,
    description: string,
    language: Language = 'ru',
    _projectId?: string,
    getPrompt?: (operation: OperationType, language: Language, params: Record<string, string>) => string,
    skipJsonParse: boolean = false
  ): Promise<T> {

    // Construct Prompt
    const prompt = getPrompt
      ? getPrompt(operation, language, { description })
      : description

    // Select Model based on operation type (heuristic)
    const feature = operation.includes('analyze') ? 'analysis' : 'default'

    try {
      const model = getModel(feature)

      const { text } = await generateText({
        model,
        prompt,
      })

      if (skipJsonParse) {
        return text as unknown as T
      }

      // Basic JSON parsing with cleanup
      const cleanJson = text.replace(/```json\n?|```/g, '').trim()
      return JSON.parse(cleanJson) as T

    } catch (error) {
      console.error('AI Generation Failed:', error)
      throw error
    }
  }

  /**
   * Generic analyze function
   */
  async analyze(
    _operation: OperationType,
    data: unknown,
    _language: Language = 'ru',
    _projectId?: string,
    _getPrompt?: any
  ): Promise<string> {
    const dataString = JSON.stringify(data, null, 2)
    const prompt = `Analyze this data:\n${dataString}`
    const model = getModel('analysis')
    const { text } = await generateText({ model, prompt })
    return text
  }

  /**
   * Generic improve function
   */
  async improve<T>(
    operation: OperationType,
    data: unknown,
    analysis: string,
    language: Language = 'ru',
    _projectId?: string,
    getPrompt?: (operation: OperationType, language: Language, params: Record<string, string>) => string
  ): Promise<T> {
    const dataString = JSON.stringify(data, null, 2)

    const prompt = getPrompt
      ? getPrompt(operation, language, { data: dataString, analysis })
      : `Improve this data based on analysis:\n${dataString}\n\nAnalysis:\n${analysis}`

    return this.generate<T>(operation, prompt, language, undefined, undefined)
  }
}

export const aiService = AIService.getInstance()
