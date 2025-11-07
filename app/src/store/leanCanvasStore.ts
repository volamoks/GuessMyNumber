import { create } from 'zustand'
import type { BaseArtifactData, BaseArtifactStore } from './base'
import { createBaseStoreState, createBaseStoreActions } from './base'

/**
 * Lean Canvas specific data structure
 * Extends BaseArtifactData with lean canvas fields
 */
export interface LeanCanvasData extends BaseArtifactData {
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
 * Lean Canvas Store
 * Uses base artifact store structure to eliminate code duplication
 */
type LeanCanvasStore = BaseArtifactStore<LeanCanvasData>

/**
 * Lean Canvas Store Hook
 * Reduced from 92 lines to ~40 lines using base architecture
 */
export const useLeanCanvasStore = create<LeanCanvasStore>((set) => ({
  // Initialize with base state
  ...createBaseStoreState<LeanCanvasData>(),

  // Initialize with base actions
  ...createBaseStoreActions<LeanCanvasData>(set),

  // Add any lean-canvas-specific state or actions here if needed
}))
