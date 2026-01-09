/**
 * Gantt Chart Types
 * Shared type definitions for gantt components
 */

/**
 * Timeline scale options
 */
export type TimeScale = 'day' | 'week' | 'month' | 'quarter'

/**
 * Color scheme options (field to colorize by)
 */
export type ColorScheme = 'type' | 'status' | 'priority' | 'assignee'

/**
 * Gantt column configuration
 */
export interface GanttColumn {
  id: string
  name: string
  label: string
  width: number
  visible: boolean
  resize: boolean
  align?: 'left' | 'center' | 'right'
}

/**
 * Task type color mapping
 */
export interface TaskTypeColor {
  type: string
  color: string
  label: string
}

/**
 * Gantt settings configuration
 */
export interface GanttSettingsConfig {
  colorScheme: ColorScheme
  timeScale: TimeScale
}
