import { create } from 'zustand'
import type { BaseArtifactData, BaseArtifactStore } from './base'
import { createBaseStoreState, createBaseStoreActions } from './base'

/**
 * Business Canvas specific data structure
 * Extends BaseArtifactData with business model canvas fields
 */
export interface BusinessCanvasData extends BaseArtifactData {
  keyPartners: string[]
  keyActivities: string[]
  keyResources: string[]
  valueProposition: string[]
  customerRelationships: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: string[]
  revenueStreams: string[]
}

/**
 * Business Canvas Store
 * Uses base artifact store structure to eliminate code duplication
 */
type BusinessCanvasStore = BaseArtifactStore<BusinessCanvasData>

/**
 * Business Canvas Store Hook
 * Reduced from 92 lines to ~40 lines using base architecture
 */
export const useBusinessCanvasStore = create<BusinessCanvasStore>((set) => ({
  // Initialize with base state
  ...createBaseStoreState<BusinessCanvasData>(),

  // Initialize with base actions
  ...createBaseStoreActions<BusinessCanvasData>(set),

  // Add any business-canvas-specific state or actions here if needed
}))
