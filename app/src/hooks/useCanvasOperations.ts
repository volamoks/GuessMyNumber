/**
 * Business Logic Hook: Canvas Operations
 * Handles generate/analyze/improve operations with proper error handling
 * Separates business logic from UI components
 */

import { useState } from 'react'
import { toast } from 'sonner'
import type { Language } from '@/lib/services/ai-prompts'

export interface CanvasOperationsConfig<T> {
  generateFn: (description: string, language: Language, projectId?: string) => Promise<T>
  analyzeFn: (data: T, language: Language, projectId?: string) => Promise<string>
  improveFn: (data: T, analysis: string, language: Language, projectId?: string) => Promise<T>
  currentProjectId?: string
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export interface CanvasOperationsResult<T> {
  // State
  isGenerating: boolean
  isAnalyzing: boolean
  isImproving: boolean
  analysis: string | null

  // Operations
  generate: (description: string, language: Language) => Promise<T | null>
  analyze: (data: T, language: Language) => Promise<string | null>
  improve: (data: T, language: Language) => Promise<T | null>

  // Helpers
  clearAnalysis: () => void
  isAnyOperationInProgress: boolean
}

/**
 * Hook for managing canvas operations (generate/analyze/improve)
 * Provides consistent error handling and loading states
 */
export function useCanvasOperations<T>(
  config: CanvasOperationsConfig<T>
): CanvasOperationsResult<T> {
  const { generateFn, analyzeFn, improveFn, currentProjectId, onSuccess, onError } = config

  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)

  /**
   * Generic operation wrapper - handles try-catch, loading states, and toasts
   */
  const executeOperation = async <R,>(
    operation: () => Promise<R>,
    setLoading: (loading: boolean) => void,
    loadingMessage: string,
    successMessage: string,
    errorPrefix: string
  ): Promise<R | null> => {
    setLoading(true)
    const loadingToast = toast.loading(loadingMessage)

    try {
      const result = await operation()

      toast.success(successMessage, { id: loadingToast })
      onSuccess?.(successMessage)

      return result
    } catch (error) {
      const errorMessage = `${errorPrefix}: ${(error as Error).message}`
      toast.error(errorMessage, { id: loadingToast })
      onError?.(errorMessage)

      return null
    } finally {
      setLoading(false)
    }
  }

  const generate = async (description: string, language: Language): Promise<T | null> => {
    return executeOperation(
      () => generateFn(description, language, currentProjectId),
      setIsGenerating,
      'Генерация...',
      'Успешно сгенерировано!',
      'Ошибка генерации'
    )
  }

  const analyze = async (data: T, language: Language): Promise<string | null> => {
    const result = await executeOperation(
      () => analyzeFn(data, language, currentProjectId),
      setIsAnalyzing,
      'Анализ...',
      'Анализ завершен!',
      'Ошибка анализа'
    )

    if (result) {
      setAnalysis(result)
    }

    return result
  }

  const improve = async (data: T, language: Language): Promise<T | null> => {
    if (!analysis) {
      toast.error('Сначала выполните анализ')
      return null
    }

    const result = await executeOperation(
      () => improveFn(data, analysis, language, currentProjectId),
      setIsImproving,
      'Улучшение...',
      'Успешно улучшено на основе анализа!',
      'Ошибка улучшения'
    )

    // Clear analysis after successful improvement
    if (result) {
      setAnalysis(null)
    }

    return result
  }

  const clearAnalysis = () => {
    setAnalysis(null)
  }

  const isAnyOperationInProgress = isGenerating || isAnalyzing || isImproving

  return {
    // State
    isGenerating,
    isAnalyzing,
    isImproving,
    analysis,

    // Operations
    generate,
    analyze,
    improve,

    // Helpers
    clearAnalysis,
    isAnyOperationInProgress,
  }
}
