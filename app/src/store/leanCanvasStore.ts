import { create } from 'zustand'
import { createBaseStore, type BaseStore } from './baseStore'

/**
 * Lean Canvas Data
 * Complete structure of a Lean Canvas with all building blocks
 */
export interface LeanCanvasData {
  title: string
  problem: string[]
  solution: string[]
  keyMetrics: string[]
  uniqueValueProposition: string
  unfairAdvantage: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
}

/**
 * Lean Canvas Store - extends BaseStore with LeanCanvasData type
 * No custom actions needed - all functionality comes from base store
 */
export type LeanCanvasStore = BaseStore<LeanCanvasData>

/**
 * Lean Canvas Store Hook
 * Uses base store factory to eliminate code duplication
 */
export const useLeanCanvasStore = create<LeanCanvasStore>((set) => ({
  ...createBaseStore<LeanCanvasData>(set),
}))
