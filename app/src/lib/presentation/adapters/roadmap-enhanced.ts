/**
 * Enhanced адаптер для Roadmap с визуализацией (charts, custom layouts)
 */

import type { RoadmapData, RoadmapFeature } from '@/lib/schemas'
import type { ChartData } from '../export/renderers/chart'

/**
 * Генерирует bar chart для распределения фич по фазам
 */
export function roadmapToChartData(data: RoadmapData): ChartData {
  return {
    type: 'bar',
    title: 'Feature Distribution',
    data: [
      {
        name: 'Features',
        labels: ['Now', 'Next', 'Later'],
        values: [data.now.length, data.next.length, data.later.length],
      },
    ],
  }
}

/**
 * Генерирует pie chart для приоритетов
 */
export function roadmapToPriorityChart(data: RoadmapData): ChartData {
  const allFeatures = [...data.now, ...data.next, ...data.later]

  const highCount = allFeatures.filter(f => f.priority === 'high').length
  const mediumCount = allFeatures.filter(f => f.priority === 'medium').length
  const lowCount = allFeatures.filter(f => f.priority === 'low').length

  return {
    type: 'pie',
    title: 'Priority Distribution',
    data: [
      {
        name: 'Priority',
        labels: ['High', 'Medium', 'Low'],
        values: [highCount, mediumCount, lowCount],
      },
    ],
  }
}

/**
 * Генерирует pie chart для effort распределения
 */
export function roadmapToEffortChart(data: RoadmapData): ChartData {
  const allFeatures = [...data.now, ...data.next, ...data.later]

  const largeCount = allFeatures.filter(f => f.effort === 'large').length
  const mediumCount = allFeatures.filter(f => f.effort === 'medium').length
  const smallCount = allFeatures.filter(f => f.effort === 'small').length

  return {
    type: 'pie',
    title: 'Effort Distribution',
    data: [
      {
        name: 'Effort',
        labels: ['Large', 'Medium', 'Small'],
        values: [largeCount, mediumCount, smallCount],
      },
    ],
  }
}

/**
 * Генерирует line chart для прогресса по статусам
 */
export function roadmapToProgressChart(data: RoadmapData): ChartData {
  const phases = ['Now', 'Next', 'Later']
  const datasets = [data.now, data.next, data.later]

  const doneValues = datasets.map(phase => phase.filter(f => f.status === 'done').length)
  const inProgressValues = datasets.map(phase => phase.filter(f => f.status === 'in_progress').length)
  const planningValues = datasets.map(phase => phase.filter(f => f.status === 'planning').length)

  return {
    type: 'line',
    title: 'Status Progress',
    data: [
      { name: 'Done', labels: phases, values: doneValues },
      { name: 'In Progress', labels: phases, values: inProgressValues },
      { name: 'Planning', labels: phases, values: planningValues },
    ],
  }
}

/**
 * Генерирует категории для roadmap (для визуализации)
 */
export function getRoadmapCategories(data: RoadmapData): Record<string, RoadmapFeature[]> {
  const allFeatures = [...data.now, ...data.next, ...data.later]

  return {
    feature: allFeatures.filter(f => f.category === 'feature'),
    bug_fix: allFeatures.filter(f => f.category === 'bug_fix'),
    tech_debt: allFeatures.filter(f => f.category === 'tech_debt'),
    improvement: allFeatures.filter(f => f.category === 'improvement'),
  }
}

/**
 * Подготавливает данные для трёхколоночного layout
 */
export interface RoadmapColumnData {
  title: string
  items: Array<{
    text: string
    priority: 'high' | 'medium' | 'low'
    effort: 'large' | 'medium' | 'small'
  }>
}

export function prepareRoadmapColumns(data: RoadmapData): RoadmapColumnData[] {
  const formatFeature = (f: RoadmapFeature) => ({
    text: f.title,
    priority: f.priority,
    effort: f.effort,
  })

  return [
    {
      title: '🔥 NOW',
      items: data.now.map(formatFeature),
    },
    {
      title: '🎯 NEXT',
      items: data.next.map(formatFeature),
    },
    {
      title: '🔮 LATER',
      items: data.later.map(formatFeature),
    },
  ]
}
