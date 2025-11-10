/**
 * Validation Service
 * Centralized validation using Zod schemas
 */

import { BaseService, type ServiceResult, success, error } from './base-service'
import {
  CJMDataSchema,
  BusinessCanvasDataSchema,
  LeanCanvasDataSchema,
  RoadmapDataSchema,
  type CJMData,
  type BusinessCanvasData,
  type LeanCanvasData,
  type RoadmapData,
} from '../schemas'

/**
 * ValidationService - Centralized data validation
 *
 * Provides validation methods for all data models using Zod schemas
 */
export class ValidationService extends BaseService {
  private static instance: ValidationService

  private constructor() {
    super({ enableLogging: true, throwOnError: false })
  }

  /**
   * Get singleton instance
   */
  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService()
    }
    return ValidationService.instance
  }

  /**
   * Validate Customer Journey Map data
   */
  validateCJM(data: unknown): ServiceResult<CJMData> {
    const result = this.safeValidate(CJMDataSchema, data)
    if (result.success) {
      return success(result.data)
    }
    return error('VALIDATION_ERROR', result.error.message, result.error.details)
  }

  /**
   * Validate Business Canvas data
   */
  validateBusinessCanvas(data: unknown): ServiceResult<BusinessCanvasData> {
    const result = this.safeValidate(BusinessCanvasDataSchema, data)
    if (result.success) {
      return success(result.data)
    }
    return error('VALIDATION_ERROR', result.error.message, result.error.details)
  }

  /**
   * Validate Lean Canvas data
   */
  validateLeanCanvas(data: unknown): ServiceResult<LeanCanvasData> {
    const result = this.safeValidate(LeanCanvasDataSchema, data)
    if (result.success) {
      return success(result.data)
    }
    return error('VALIDATION_ERROR', result.error.message, result.error.details)
  }

  /**
   * Validate Roadmap data
   */
  validateRoadmap(data: unknown): ServiceResult<RoadmapData> {
    const result = this.safeValidate(RoadmapDataSchema, data)
    if (result.success) {
      return success(result.data)
    }
    return error('VALIDATION_ERROR', result.error.message, result.error.details)
  }

  /**
   * Validate JSON string and parse
   */
  validateJSON<T>(
    jsonString: string,
    validator: (data: unknown) => ServiceResult<T>
  ): ServiceResult<T> {
    try {
      const parsed = this.parseJSON(jsonString)
      return validator(parsed)
    } catch (err) {
      return error(
        'JSON_PARSE_ERROR',
        'Failed to parse JSON',
        err
      )
    }
  }
}

/**
 * Singleton instance export
 */
export const validationService = ValidationService.getInstance()
