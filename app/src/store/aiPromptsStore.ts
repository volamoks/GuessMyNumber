import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { OperationType, Language } from '@/lib/services/ai-prompts'

/**
 * Prompt template with multilingual support
 */
export interface PromptTemplate {
  ru: string
  en: string
}

/**
 * AI Prompts Store State
 */
interface AIPromptsState {
  /**
   * All prompts organized by operation type
   */
  prompts: Record<OperationType, PromptTemplate>

  /**
   * Get prompt by operation and language with parameter substitution
   */
  getPrompt: (
    operation: OperationType,
    language: Language,
    params?: Record<string, string>
  ) => string

  /**
   * Update a specific prompt
   */
  updatePrompt: (operation: OperationType, language: Language, content: string) => void

  /**
   * Reset a specific prompt to default
   */
  resetPrompt: (operation: OperationType) => void

  /**
   * Reset all prompts to defaults
   */
  resetAllPrompts: () => void

  /**
   * Check if prompt has been customized
   */
  isCustomized: (operation: OperationType) => boolean
}

/**
 * Default prompts - imported from ai-prompts service
 */
import { PROMPTS as DEFAULT_PROMPTS } from '@/lib/services/ai-prompts'

/**
 * AI Prompts Store
 * Manages AI prompt templates with persistence and customization
 */
export const useAIPromptsStore = create<AIPromptsState>()(
  persist(
    (set, get) => ({
      // Initialize with default prompts
      prompts: { ...DEFAULT_PROMPTS },

      getPrompt: (operation, language, params) => {
        const template = get().prompts[operation]?.[language] || ''

        if (!params) return template

        // Replace placeholders like {{description}} with actual values
        return Object.entries(params).reduce(
          (prompt, [key, value]) => prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value),
          template
        )
      },

      updatePrompt: (operation, language, content) => {
        set((state) => ({
          prompts: {
            ...state.prompts,
            [operation]: {
              ...state.prompts[operation],
              [language]: content,
            },
          },
        }))
      },

      resetPrompt: (operation) => {
        set((state) => ({
          prompts: {
            ...state.prompts,
            [operation]: { ...DEFAULT_PROMPTS[operation] },
          },
        }))
      },

      resetAllPrompts: () => {
        set({ prompts: { ...DEFAULT_PROMPTS } })
      },

      isCustomized: (operation) => {
        const current = get().prompts[operation]
        const defaultPrompt = DEFAULT_PROMPTS[operation]

        return (
          current.ru !== defaultPrompt.ru ||
          current.en !== defaultPrompt.en
        )
      },
    }),
    {
      name: 'ai-prompts-storage',
    }
  )
)
