import { create } from 'zustand'
import { createBaseStore, type BaseStore } from './baseStore'

/**
 * Customer Journey Map Stage
 * Represents one stage in the customer journey with all touchpoints, emotions, and metrics
 */
export interface CJMStage {
  name: string
  customerActivities: string[]
  customerGoals: string[]
  touchpoints: string[]
  experience: string[]
  positives: string[]
  negatives: string[]
  ideasOpportunities: string[]
  businessGoal: string
  kpis: string[]
  organizationalActivities: string[]
  responsibility: string[]
  technologySystems: string[]
}

/**
 * Customer Journey Map Data
 * Complete structure of a CJM with all stages
 */
export interface CJMData {
  title: string
  persona: string
  description?: string
  stages: CJMStage[]
}

/**
 * CJM Store - extends BaseStore with CJMData type
 * No custom actions needed - all functionality comes from base store
 */
export type CJMStore = BaseStore<CJMData>

/**
 * CJM Store Hook
 * Uses base store factory to eliminate code duplication
 */
export const useCJMStore = create<CJMStore>((set) => ({
  ...createBaseStore<CJMData>(set),
}))
