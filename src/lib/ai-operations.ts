/**
 * AI Operations
 * High-level functions that use AIService with AIPromptsStore
 */

import { aiService } from './ai-service-new'
import { useAIPromptsStore } from '@/features/ai/store/aiPromptsStore'
import type { Language } from './services/ai-prompts'
import type {
  CJMData,
  BusinessCanvasData,
  LeanCanvasData,
  RoadmapData,
} from './schemas'

/**
 * Get prompt function from store
 */
function getPromptFn() {
  return useAIPromptsStore.getState().getPrompt
}

// ============================================================================
// CJM Operations
// ============================================================================

export async function generateCJM(
  description: string,
  language: Language = 'ru',
  projectId?: string
): Promise<CJMData> {
  return aiService.generate<CJMData>(
    'generate_cjm',
    description,
    language,
    projectId,
    getPromptFn()
  )
}

export async function analyzeCJM(
  data: CJMData,
  language: Language = 'ru',
  projectId?: string
): Promise<string> {
  return aiService.analyze(
    'analyze_cjm',
    data,
    language,
    projectId,
    getPromptFn()
  )
}

export async function improveCJM(
  data: CJMData,
  analysis: string,
  language: Language = 'ru',
  projectId?: string
): Promise<CJMData> {
  return aiService.improve<CJMData>(
    'improve_cjm',
    data,
    analysis,
    language,
    projectId,
    getPromptFn()
  )
}

// ============================================================================
// Business Canvas Operations
// ============================================================================

export async function generateBusinessCanvas(
  description: string,
  language: Language = 'ru',
  projectId?: string
): Promise<BusinessCanvasData> {
  return aiService.generate<BusinessCanvasData>(
    'generate_business_canvas',
    description,
    language,
    projectId,
    getPromptFn()
  )
}

export async function analyzeBusinessCanvas(
  data: BusinessCanvasData,
  language: Language = 'ru',
  projectId?: string
): Promise<string> {
  return aiService.analyze(
    'analyze_business_canvas',
    data,
    language,
    projectId,
    getPromptFn()
  )
}

export async function improveBusinessCanvas(
  data: BusinessCanvasData,
  analysis: string,
  language: Language = 'ru',
  projectId?: string
): Promise<BusinessCanvasData> {
  return aiService.improve<BusinessCanvasData>(
    'improve_business_canvas',
    data,
    analysis,
    language,
    projectId,
    getPromptFn()
  )
}

// ============================================================================
// Lean Canvas Operations
// ============================================================================

export async function generateLeanCanvas(
  description: string,
  language: Language = 'ru',
  projectId?: string
): Promise<LeanCanvasData> {
  return aiService.generate<LeanCanvasData>(
    'generate_lean_canvas',
    description,
    language,
    projectId,
    getPromptFn()
  )
}

export async function analyzeLeanCanvas(
  data: LeanCanvasData,
  language: Language = 'ru',
  projectId?: string
): Promise<string> {
  return aiService.analyze(
    'analyze_lean_canvas',
    data,
    language,
    projectId,
    getPromptFn()
  )
}

export async function improveLeanCanvas(
  data: LeanCanvasData,
  analysis: string,
  language: Language = 'ru',
  projectId?: string
): Promise<LeanCanvasData> {
  return aiService.improve<LeanCanvasData>(
    'improve_lean_canvas',
    data,
    analysis,
    language,
    projectId,
    getPromptFn()
  )
}

// ============================================================================
// Roadmap Operations
// ============================================================================

export async function generateRoadmap(
  description: string,
  language: Language = 'ru',
  projectId?: string
): Promise<RoadmapData> {
  return aiService.generate<RoadmapData>(
    'generate_roadmap',
    description,
    language,
    projectId,
    getPromptFn()
  )
}

export async function analyzeRoadmap(
  data: RoadmapData,
  language: Language = 'ru',
  projectId?: string
): Promise<string> {
  return aiService.analyze(
    'analyze_roadmap',
    data,
    language,
    projectId,
    getPromptFn()
  )
}

export async function improveRoadmap(
  data: RoadmapData,
  analysis: string,
  language: Language = 'ru',
  projectId?: string
): Promise<RoadmapData> {
  return aiService.improve<RoadmapData>(
    'improve_roadmap',
    data,
    analysis,
    language,
    projectId,
    getPromptFn()
  )
}
