import { z } from 'zod'

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

export type CJMStage = z.infer<typeof CJMStageSchema>
export type CJMData = z.infer<typeof CJMDataSchema>
