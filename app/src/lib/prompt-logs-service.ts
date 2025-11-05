import { supabase } from './supabase'

export interface PromptLog {
  id: string
  created_at: string
  operation_type: string
  model_name?: string
  model_provider?: string
  prompt: string
  response?: string
  project_id?: string
  user_id?: string
  tokens_used?: number
  status: 'success' | 'error'
  error_message?: string
  duration_ms?: number
}

export interface CreatePromptLogParams {
  operation_type: string
  prompt: string
  response?: string
  model_name?: string
  model_provider?: string
  project_id?: string
  user_id?: string
  tokens_used?: number
  status?: 'success' | 'error'
  error_message?: string
  duration_ms?: number
}

class PromptLogsService {
  /**
   * Create a new prompt log entry
   */
  async createLog(params: CreatePromptLogParams): Promise<PromptLog | null> {
    try {
      const { data, error } = await supabase
        .from('prompt_logs')
        .insert({
          operation_type: params.operation_type,
          prompt: params.prompt,
          response: params.response,
          model_name: params.model_name,
          model_provider: params.model_provider,
          project_id: params.project_id,
          user_id: params.user_id,
          tokens_used: params.tokens_used,
          status: params.status || 'success',
          error_message: params.error_message,
          duration_ms: params.duration_ms,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating prompt log:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Exception in createLog:', error)
      return null
    }
  }

  /**
   * Get all prompt logs with optional filtering
   */
  async getLogs(params?: {
    operation_type?: string
    project_id?: string
    limit?: number
    offset?: number
  }): Promise<PromptLog[]> {
    try {
      let query = supabase
        .from('prompt_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (params?.operation_type) {
        query = query.eq('operation_type', params.operation_type)
      }

      if (params?.project_id) {
        query = query.eq('project_id', params.project_id)
      }

      if (params?.limit) {
        query = query.limit(params.limit)
      }

      if (params?.offset) {
        query = query.range(params.offset, params.offset + (params.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching prompt logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Exception in getLogs:', error)
      return []
    }
  }

  /**
   * Get a single prompt log by ID
   */
  async getLog(id: string): Promise<PromptLog | null> {
    try {
      const { data, error } = await supabase
        .from('prompt_logs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching prompt log:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Exception in getLog:', error)
      return null
    }
  }

  /**
   * Delete a prompt log
   */
  async deleteLog(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('prompt_logs')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting prompt log:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Exception in deleteLog:', error)
      return false
    }
  }

  /**
   * Get statistics about prompt usage
   */
  async getStatistics(): Promise<{
    total_prompts: number
    total_tokens: number
    by_operation: Record<string, number>
    by_provider: Record<string, number>
  } | null> {
    try {
      const { data: logs, error } = await supabase
        .from('prompt_logs')
        .select('operation_type, model_provider, tokens_used')

      if (error) {
        console.error('Error fetching statistics:', error)
        return null
      }

      const stats = {
        total_prompts: logs.length,
        total_tokens: logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0),
        by_operation: {} as Record<string, number>,
        by_provider: {} as Record<string, number>,
      }

      logs.forEach(log => {
        // Count by operation type
        stats.by_operation[log.operation_type] =
          (stats.by_operation[log.operation_type] || 0) + 1

        // Count by provider
        if (log.model_provider) {
          stats.by_provider[log.model_provider] =
            (stats.by_provider[log.model_provider] || 0) + 1
        }
      })

      return stats
    } catch (error) {
      console.error('Exception in getStatistics:', error)
      return null
    }
  }
}

export const promptLogsService = new PromptLogsService()
