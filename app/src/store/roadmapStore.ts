import { create } from 'zustand'
import { createBaseStore, type BaseStore } from './baseStore'

/**
 * Roadmap Feature
 * Represents a single feature/task in the product roadmap
 */
export interface RoadmapFeature {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'feature' | 'bug_fix' | 'tech_debt' | 'improvement'
  effort: 'small' | 'medium' | 'large'
  status: 'planning' | 'in_progress' | 'done'
}

/**
 * Product Roadmap Data
 * Now-Next-Later format for product planning
 */
export interface RoadmapData {
  title: string
  description: string
  now: RoadmapFeature[]
  next: RoadmapFeature[]
  later: RoadmapFeature[]
}

/**
 * Roadmap Store - extends BaseStore with RoadmapData type
 * No custom actions needed - all functionality comes from base store
 */
export type RoadmapStore = BaseStore<RoadmapData>

/**
 * Roadmap Store Hook
 * Uses base store factory to eliminate code duplication
 */
export const useRoadmapStore = create<RoadmapStore>((set) => ({
  ...createBaseStore<RoadmapData>(set),
}))
