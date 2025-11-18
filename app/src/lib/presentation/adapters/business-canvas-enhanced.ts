/**
 * Enhanced адаптер для Business Canvas с визуализацией
 */

import type { BusinessCanvasData } from '@/lib/schemas'
import type { ChartData } from '../export/renderers/chart'

/**
 * Генерирует pie chart для распределения элементов по блокам
 */
export function canvasToPieChart(data: BusinessCanvasData): ChartData {
  const labels: string[] = []
  const values: number[] = []

  const blocks = [
    { name: 'Key Partners', data: data.keyPartners },
    { name: 'Key Activities', data: data.keyActivities },
    { name: 'Value Props', data: data.valueProposition },
    { name: 'Customer Relations', data: data.customerRelationships },
    { name: 'Channels', data: data.channels },
    { name: 'Customer Segments', data: data.customerSegments },
    { name: 'Key Resources', data: data.keyResources },
    { name: 'Cost Structure', data: data.costStructure },
    { name: 'Revenue Streams', data: data.revenueStreams },
  ]

  blocks.forEach(block => {
    if (block.data.length > 0) {
      labels.push(block.name)
      values.push(block.data.length)
    }
  })

  return {
    type: 'pie',
    title: 'Canvas Coverage',
    data: [
      {
        name: 'Blocks',
        labels,
        values,
      },
    ],
  }
}

/**
 * Генерирует bar chart для метрик canvas
 */
export function canvasToMetricsChart(data: BusinessCanvasData): ChartData {
  return {
    type: 'bar',
    title: 'Block Completeness',
    data: [
      {
        name: 'Items Count',
        labels: [
          'Partners',
          'Activities',
          'Resources',
          'Value Props',
          'Relations',
          'Channels',
          'Segments',
          'Costs',
          'Revenue',
        ],
        values: [
          data.keyPartners.length,
          data.keyActivities.length,
          data.keyResources.length,
          data.valueProposition.length,
          data.customerRelationships.length,
          data.channels.length,
          data.customerSegments.length,
          data.costStructure.length,
          data.revenueStreams.length,
        ],
      },
    ],
  }
}

/**
 * Подготавливает данные для grid layout (3x3)
 */
export interface CanvasGridCell {
  title: string
  items: string[]
  color: string
}

export function prepareCanvasGrid(data: BusinessCanvasData): CanvasGridCell[][] {
  // Возвращаем 3 строки по 3 ячейки
  return [
    // Row 1
    [
      {
        title: '🤝 Key Partners',
        items: data.keyPartners,
        color: '#3B82F6',
      },
      {
        title: '⚙️ Key Activities',
        items: data.keyActivities,
        color: '#8B5CF6',
      },
      {
        title: '💎 Value Propositions',
        items: data.valueProposition,
        color: '#10B981',
      },
    ],
    // Row 2
    [
      {
        title: '📦 Key Resources',
        items: data.keyResources,
        color: '#F59E0B',
      },
      {
        title: '💬 Customer Relationships',
        items: data.customerRelationships,
        color: '#EF4444',
      },
      {
        title: '👥 Customer Segments',
        items: data.customerSegments,
        color: '#EC4899',
      },
    ],
    // Row 3
    [
      {
        title: '📢 Channels',
        items: data.channels,
        color: '#06B6D4',
      },
      {
        title: '💰 Cost Structure',
        items: data.costStructure,
        color: '#F97316',
      },
      {
        title: '💵 Revenue Streams',
        items: data.revenueStreams,
        color: '#84CC16',
      },
    ],
  ]
}

/**
 * Проверяет полноту заполнения Canvas
 */
export function getCanvasCompleteness(data: BusinessCanvasData): {
  total: number
  filled: number
  percentage: number
  missing: string[]
} {
  const blocks = [
    { name: 'Key Partners', data: data.keyPartners },
    { name: 'Key Activities', data: data.keyActivities },
    { name: 'Key Resources', data: data.keyResources },
    { name: 'Value Propositions', data: data.valueProposition },
    { name: 'Customer Relationships', data: data.customerRelationships },
    { name: 'Channels', data: data.channels },
    { name: 'Customer Segments', data: data.customerSegments },
    { name: 'Cost Structure', data: data.costStructure },
    { name: 'Revenue Streams', data: data.revenueStreams },
  ]

  const filled = blocks.filter(b => b.data.length > 0).length
  const missing = blocks.filter(b => b.data.length === 0).map(b => b.name)

  return {
    total: blocks.length,
    filled,
    percentage: Math.round((filled / blocks.length) * 100),
    missing,
  }
}
