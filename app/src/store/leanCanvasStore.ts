import { create } from 'zustand'
import { createBaseStore, type BaseStore } from './baseStore'
import type { LeanCanvasData } from '@/lib/schemas'

/**
 * Lean Canvas Store - extends BaseStore with LeanCanvasData type
 * No custom actions needed - all functionality comes from base store
 *
 * Note: LeanCanvasData type is now imported from Zod schemas
 * to ensure runtime validation matches TypeScript types
 */
export type LeanCanvasStore = BaseStore<LeanCanvasData>

// Re-export type for convenience
export type { LeanCanvasData }

/**
 * Lean Canvas Store Hook
 * Uses base store factory to eliminate code duplication
 */
export const useLeanCanvasStore = create<LeanCanvasStore>((set) => ({
  ...createBaseStore<LeanCanvasData>(set),
}))
