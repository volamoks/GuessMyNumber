import { create } from 'zustand'
import { createBaseStore, type BaseStore } from './baseStore'
import type { BusinessCanvasData } from '@/lib/schemas'

/**
 * Business Canvas Store - extends BaseStore with BusinessCanvasData type
 * No custom actions needed - all functionality comes from base store
 *
 * Note: BusinessCanvasData type is now imported from Zod schemas
 * to ensure runtime validation matches TypeScript types
 */
export type BusinessCanvasStore = BaseStore<BusinessCanvasData>

// Re-export type for convenience
export type { BusinessCanvasData }

/**
 * Business Canvas Store Hook
 * Uses base store factory to eliminate code duplication
 */
export const useBusinessCanvasStore = create<BusinessCanvasStore>((set) => ({
  ...createBaseStore<BusinessCanvasData>(set),
}))
