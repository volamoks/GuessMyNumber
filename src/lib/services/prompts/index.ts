import { cjmPrompts } from './cjm'
import { canvasPrompts } from './canvas'
import { roadmapPrompts } from './roadmap'
import { presentationPrompts } from './presentation'
import { miscPrompts } from './misc'
import type { OperationType, Language, PromptTemplate } from './types'

export type { OperationType, Language, PromptTemplate }

export const PROMPTS: Record<OperationType, PromptTemplate> = {
    ...cjmPrompts,
    ...canvasPrompts,
    ...roadmapPrompts,
    ...presentationPrompts,
    ...miscPrompts,
}

/**
 * Get prompt by operation type and language
 */
export function getPrompt(
    operation: OperationType,
    language: Language,
    params?: Record<string, string>
): string {
    const template = PROMPTS[operation][language]

    if (!params) return template

    // Replace placeholders like {{description}} with actual values
    return Object.entries(params).reduce(
        (prompt, [key, value]) => prompt.replace(new RegExp(`{{${key}}}`, 'g'), value),
        template
    )
}
