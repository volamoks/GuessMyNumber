/**
 * Zod Schemas for Data Validation
 * Provides type-safe validation for all data models in the application
 */

import { z } from 'zod'

// Customer Journey Map (CJM) Schemas
export * from '@/features/cjm/types/schema'

// Business Model Canvas Schemas
// Lean Canvas Schemas
export * from '@/features/canvases/types/schema'

// Roadmap Schemas
export * from '@/features/roadmap/types/schema'

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validate data with a Zod schema and return type-safe result
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

/**
 * Parse data with Zod schema (throws on error)
 */
export function parse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Get user-friendly error messages from Zod errors
 */
export function getErrorMessages(zodError: z.ZodError): string[] {
  return zodError.issues.map((err: z.ZodIssue) => {
    const path = err.path.join('.')
    return path ? `${path}: ${err.message}` : err.message
  })
}
