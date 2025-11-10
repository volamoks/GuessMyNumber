import { create } from 'zustand'
import { createBaseStore, type BaseStore } from './baseStore'

/**
 * Business Model Canvas Data
 * Complete structure of a Business Model Canvas with all 9 building blocks
 */
export interface BusinessCanvasData {
  title: string
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
 * Business Canvas Store - extends BaseStore with BusinessCanvasData type
 * No custom actions needed - all functionality comes from base store
 */
export type BusinessCanvasStore = BaseStore<BusinessCanvasData>

/**
 * Business Canvas Store Hook
 * Uses base store factory to eliminate code duplication
 */
export const useBusinessCanvasStore = create<BusinessCanvasStore>((set) => ({
  ...createBaseStore<BusinessCanvasData>(set),
}))
