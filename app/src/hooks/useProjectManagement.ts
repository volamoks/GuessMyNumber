/**
 * Business Logic Hook: Project Management
 * Handles save/load/version operations for project data
 * Separates project management logic from UI components
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export interface ProjectManagementConfig<T> {
  currentProjectId?: string
  saveFn?: (projectId: string, data: T) => Promise<void>
  loadFn?: (projectId: string) => Promise<T | null>
  onDataLoaded?: (data: T) => void
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export interface ProjectManagementResult<T> {
  // State
  isSaving: boolean
  isLoading: boolean

  // Operations
  save: (data: T) => Promise<boolean>
  load: () => Promise<T | null>

  // Helpers
  hasProject: boolean
  isAnyOperationInProgress: boolean
}

/**
 * Hook for managing project operations (save/load)
 * Provides consistent error handling and loading states
 */
export function useProjectManagement<T>(
  config: ProjectManagementConfig<T>
): ProjectManagementResult<T> {
  const { currentProjectId, saveFn, loadFn, onDataLoaded, onSuccess, onError } = config

  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Generic operation wrapper - handles try-catch, loading states, and toasts
   */
  const executeOperation = async <R,>(
    operation: () => Promise<R>,
    setLoadingState: (loading: boolean) => void,
    loadingMessage: string,
    successMessage: string,
    errorPrefix: string
  ): Promise<R | null> => {
    setLoadingState(true)
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
      setLoadingState(false)
    }
  }

  const save = useCallback(
    async (data: T): Promise<boolean> => {
      if (!currentProjectId || !saveFn) {
        toast.error('Проект не выбран или функция сохранения недоступна')
        return false
      }

      const result = await executeOperation(
        async () => {
          await saveFn(currentProjectId, data)
          return true
        },
        setIsSaving,
        'Сохранение...',
        'Данные сохранены в проект!',
        'Ошибка сохранения'
      )

      return result !== null
    },
    [currentProjectId, saveFn]
  )

  const load = useCallback(async (): Promise<T | null> => {
    if (!currentProjectId || !loadFn) {
      toast.error('Проект не выбран или функция загрузки недоступна')
      return null
    }

    const result = await executeOperation(
      () => loadFn(currentProjectId),
      setIsLoading,
      'Загрузка...',
      'Данные загружены из проекта!',
      'Ошибка загрузки'
    )

    if (result && onDataLoaded) {
      onDataLoaded(result)
    }

    return result
  }, [currentProjectId, loadFn, onDataLoaded])

  const hasProject = !!currentProjectId
  const isAnyOperationInProgress = isSaving || isLoading

  return {
    // State
    isSaving,
    isLoading,

    // Operations
    save,
    load,

    // Helpers
    hasProject,
    isAnyOperationInProgress,
  }
}
