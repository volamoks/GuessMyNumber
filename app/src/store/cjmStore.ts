import { create } from 'zustand'
import { createBaseStore, type BaseStore } from './baseStore'
import type { CJMData, CJMStage } from '@/lib/schemas'

/**
 * CJM Store - extends BaseStore with CJMData type
 * No custom actions needed - all functionality comes from base store
 *
 * Note: CJMData and CJMStage types are now imported from Zod schemas
 * to ensure runtime validation matches TypeScript types
 */
export type CJMStore = BaseStore<CJMData>

// Re-export types for convenience
export type { CJMData, CJMStage }

/**
 * CJM Store Hook
 * Uses base store factory to eliminate code duplication
 */
export const useCJMStore = create<CJMStore>((set) => ({
  ...createBaseStore<CJMData>(set),
}))
