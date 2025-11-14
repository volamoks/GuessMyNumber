import { create } from 'zustand'
import { createBaseStore, type BaseStore } from './baseStore'
import type { RoadmapData, RoadmapFeature } from '@/lib/schemas'

/**
 * Roadmap Store - extends BaseStore with RoadmapData type
 * No custom actions needed - all functionality comes from base store
 *
 * Note: RoadmapData and RoadmapFeature types are now imported from Zod schemas
 * to ensure runtime validation matches TypeScript types
 */
export type RoadmapStore = BaseStore<RoadmapData>

// Re-export types for convenience
export type { RoadmapData, RoadmapFeature }

/**
 * Roadmap Store Hook
 * Uses base store factory to eliminate code duplication
 */
export const useRoadmapStore = create<RoadmapStore>((set) => ({
  ...createBaseStore<RoadmapData>(set),
}))
