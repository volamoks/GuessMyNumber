/**
 * Zod Schemas for Data Validation
 * Provides type-safe validation for all data models in the application
 */

import { z } from 'zod'

// ============================================================================
// Customer Journey Map (CJM) Schemas
// ============================================================================

/**
 * CJM Stage Schema
 * Validates a single stage in the customer journey
 */
export const CJMStageSchema = z.object({
  name: z.string().min(1, 'Stage name is required'),
  customerActivities: z.array(z.string()).default([]),
  customerGoals: z.array(z.string()).default([]),
  touchpoints: z.array(z.string()).default([]),
  experience: z.array(z.string()).default([]),
  positives: z.array(z.string()).default([]),
  negatives: z.array(z.string()).default([]),
  ideasOpportunities: z.array(z.string()).default([]),
  businessGoal: z.string().default(''),
  kpis: z.array(z.string()).default([]),
  organizationalActivities: z.array(z.string()).default([]),
  responsibility: z.array(z.string()).default([]),
  technologySystems: z.array(z.string()).default([]),
})

/**
 * CJM Data Schema
 * Validates complete Customer Journey Map structure
 */
export const CJMDataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  persona: z.string().min(1, 'Persona is required'),
  description: z.string().optional(),
  stages: z.array(CJMStageSchema).min(1, 'At least one stage is required'),
})

// ============================================================================
// Business Model Canvas Schemas
// ============================================================================

/**
 * Business Canvas Data Schema
 * Validates Business Model Canvas with all 9 building blocks
 */
export const BusinessCanvasDataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  keyPartners: z.array(z.string()).default([]),
  keyActivities: z.array(z.string()).default([]),
  keyResources: z.array(z.string()).default([]),
  valueProposition: z.array(z.string()).default([]),
  customerRelationships: z.array(z.string()).default([]),
  channels: z.array(z.string()).default([]),
  customerSegments: z.array(z.string()).default([]),
  costStructure: z.array(z.string()).default([]),
  revenueStreams: z.array(z.string()).default([]),
})

// ============================================================================
// Lean Canvas Schemas
// ============================================================================

/**
 * Lean Canvas Data Schema
 * Validates Lean Canvas structure
 */
export const LeanCanvasDataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  problem: z.array(z.string()).default([]),
  solution: z.array(z.string()).default([]),
  keyMetrics: z.array(z.string()).default([]),
  uniqueValueProposition: z.string().default(''),
  unfairAdvantage: z.array(z.string()).default([]),
  channels: z.array(z.string()).default([]),
  customerSegments: z.array(z.string()).default([]),
  costStructure: z.array(z.string()).default([]),
  revenueStreams: z.array(z.string()).default([]),
})

// ============================================================================
// Roadmap Schemas
// ============================================================================

/**
 * Roadmap Feature Schema
 * Validates a single feature/task in the product roadmap
 */
export const RoadmapFeatureSchema = z.object({
  title: z.string().min(1, 'Feature title is required'),
  description: z.string().default(''),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  category: z
    .enum(['feature', 'bug_fix', 'tech_debt', 'improvement'])
    .default('feature'),
  effort: z.enum(['small', 'medium', 'large']).default('medium'),
  status: z.enum(['planning', 'in_progress', 'done']).default('planning'),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
})

/**
 * Roadmap Data Schema
 * Validates Now-Next-Later roadmap format
 */
export const RoadmapDataSchema = z.object({
  title: z.string().min(1, 'Roadmap title is required'),
  description: z.string().default(''),
  now: z.array(RoadmapFeatureSchema).default([]),
  next: z.array(RoadmapFeatureSchema).default([]),
  later: z.array(RoadmapFeatureSchema).default([]),
})

// ============================================================================
// Type Inference
// ============================================================================

/**
 * Inferred TypeScript types from Zod schemas
 * Use these instead of manually defining types
 */
export type CJMStage = z.infer<typeof CJMStageSchema>
export type CJMData = z.infer<typeof CJMDataSchema>
export type BusinessCanvasData = z.infer<typeof BusinessCanvasDataSchema>
export type LeanCanvasData = z.infer<typeof LeanCanvasDataSchema>
export type RoadmapFeature = z.infer<typeof RoadmapFeatureSchema>
export type RoadmapData = z.infer<typeof RoadmapDataSchema>

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
