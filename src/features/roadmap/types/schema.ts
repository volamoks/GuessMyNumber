import { z } from 'zod'

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

export type RoadmapFeature = z.infer<typeof RoadmapFeatureSchema>
export type RoadmapData = z.infer<typeof RoadmapDataSchema>
