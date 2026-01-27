import { z } from 'zod'

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

export type BusinessCanvasData = z.infer<typeof BusinessCanvasDataSchema>
export type LeanCanvasData = z.infer<typeof LeanCanvasDataSchema>
