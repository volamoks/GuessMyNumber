import { create } from 'zustand'
import type { BaseArtifactData, BaseArtifactStore } from './base'
import { createBaseStoreState, createBaseStoreActions } from './base'

/**
 * Customer Journey Map specific data structure
 * Extends BaseArtifactData with CJM-specific fields
 */
export interface CJMData extends BaseArtifactData {
  persona: string
  description?: string
  stages: any[] // TODO: Define proper Stage type in future
}

/**
 * CJM Store
 * Uses base artifact store structure to eliminate code duplication
 */
type CJMStore = BaseArtifactStore<CJMData>

/**
 * CJM Store Hook
 * Reduced from 86 lines to ~40 lines using base architecture
 */
export const useCJMStore = create<CJMStore>((set) => ({
  // Initialize with base state
  ...createBaseStoreState<CJMData>(),

  // Initialize with base actions
  ...createBaseStoreActions<CJMData>(set),

  // Add any CJM-specific state or actions here if needed
}))
