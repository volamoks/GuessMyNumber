/**
 * Base Service Class
 * Provides common functionality for all services: error handling, logging, configuration
 */

import { z } from 'zod'

export interface ServiceConfig {
  enableLogging?: boolean
  throwOnError?: boolean
}

export interface ServiceError {
  code: string
  message: string
  details?: unknown
}

/**
 * Base service with common error handling and logging
 */
export abstract class BaseService {
  protected config: ServiceConfig

  constructor(config: ServiceConfig = {}) {
    this.config = {
      enableLogging: config.enableLogging ?? true,
      throwOnError: config.throwOnError ?? true,
    }
  }

  /**
   * Log message (only if logging enabled)
   */
  protected log(message: string, ...args: unknown[]): void {
    if (this.config.enableLogging) {
      console.log(`[${this.constructor.name}]`, message, ...args)
    }
  }

  /**
   * Log error (always logged)
   */
  protected logError(message: string, error: unknown): void {
    console.error(`[${this.constructor.name}] ${message}`, error)
  }

  /**
   * Handle error consistently across all services
   */
  protected handleError(message: string, error: unknown): ServiceError {
    const serviceError: ServiceError = {
      code: 'SERVICE_ERROR',
      message,
      details: error,
    }

    this.logError(message, error)

    if (this.config.throwOnError) {
      throw new Error(message)
    }

    return serviceError
  }

  /**
   * Validate required fields
   */
  protected validateRequired(
    data: Record<string, unknown>,
    requiredFields: string[]
  ): void {
    const missing = requiredFields.filter((field) => !data[field])
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }
  }

  /**
   * Safe JSON parse with error handling
   */
  protected parseJSON<T = unknown>(json: string): T {
    try {
      return JSON.parse(json) as T
    } catch (error) {
      throw this.handleError('Failed to parse JSON', error)
    }
  }

  /**
   * Safe fetch with error handling
   */
  protected async fetch<T = unknown>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return (await response.json()) as T
    } catch (error) {
      throw this.handleError(`Fetch failed: ${url}`, error)
    }
  }

  /**
   * Validate data with Zod schema
   * Returns validated data or throws detailed validation error
   */
  protected validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err: z.ZodIssue) => {
          const path = err.path.join('.')
          return path ? `${path}: ${err.message}` : err.message
        })
        throw this.handleError(
          `Validation failed: ${messages.join('; ')}`,
          error
        )
      }
      throw this.handleError('Validation failed', error)
    }
  }

  /**
   * Safe validate with Zod schema
   * Returns result object instead of throwing
   */
  protected safeValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
  ): { success: true; data: T } | { success: false; error: ServiceError } {
    try {
      const validated = schema.parse(data)
      return { success: true, data: validated }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((err: z.ZodIssue) => {
          const path = err.path.join('.')
          return path ? `${path}: ${err.message}` : err.message
        })
        this.logError('Validation failed', error)
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: messages.join('; '),
            details: error.issues,
          },
        }
      }
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: error },
      }
    }
  }
}

/**
 * Generic Result type for service operations
 */
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError }

/**
 * Create success result
 */
export function success<T>(data: T): ServiceResult<T> {
  return { success: true, data }
}

/**
 * Create error result
 */
export function error(code: string, message: string, details?: unknown): ServiceResult<never> {
  return { success: false, error: { code, message, details } }
}
