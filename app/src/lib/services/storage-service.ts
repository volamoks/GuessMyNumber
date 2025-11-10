/**
 * Storage Service
 * Centralized service for localStorage/sessionStorage operations with type safety
 */

import { BaseService } from './base-service'

export type StorageType = 'local' | 'session'

/**
 * Storage Service - Type-safe wrapper around browser storage
 */
export class StorageService extends BaseService {
  private storage: Storage

  constructor(type: StorageType = 'local') {
    super({ enableLogging: false })
    this.storage = type === 'local' ? localStorage : sessionStorage
  }

  /**
   * Get item from storage with type safety
   */
  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      this.logError(`Failed to get ${key}`, error)
      return null
    }
  }

  /**
   * Set item in storage
   */
  set<T>(key: string, value: T): boolean {
    try {
      this.storage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      this.logError(`Failed to set ${key}`, error)
      return false
    }
  }

  /**
   * Remove item from storage
   */
  remove(key: string): boolean {
    try {
      this.storage.removeItem(key)
      return true
    } catch (error) {
      this.logError(`Failed to remove ${key}`, error)
      return false
    }
  }

  /**
   * Clear all storage
   */
  clear(): boolean {
    try {
      this.storage.clear()
      return true
    } catch (error) {
      this.logError('Failed to clear storage', error)
      return false
    }
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.storage.getItem(key) !== null
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Object.keys(this.storage)
  }

  /**
   * Get storage size in bytes (approximate)
   */
  getSize(): number {
    let size = 0
    for (const key of this.keys()) {
      const item = this.storage.getItem(key)
      if (item) {
        size += key.length + item.length
      }
    }
    return size
  }
}

/**
 * Singleton instances
 */
export const localStorageService = new StorageService('local')
export const sessionStorageService = new StorageService('session')
