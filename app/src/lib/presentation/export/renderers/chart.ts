/**
 * Рендерер для графиков и диаграмм
 */

import type PptxGenJS from 'pptxgenjs'
import type { RenderContext, RenderResult } from '../../types/export'

export interface ChartData {
  type: 'bar' | 'pie' | 'line' | 'area' | 'doughnut'
  data: ChartDataItem[]
  title?: string
  showLegend?: boolean
  showTitle?: boolean
}

export interface ChartDataItem {
  name: string
  labels: string[]
  values: number[]
}

/**
 * Рендерит график
 */
export function renderChart(
  slide: PptxGenJS.Slide,
  chartData: ChartData,
  context: RenderContext
): RenderResult {
  const chartHeight = 3.5
  const chartWidth = context.contentWidth

  // Преобразуем данные в формат PptxGenJS
  const pptxChartData = chartData.data.map(item => ({
    name: item.name,
    labels: item.labels,
    values: item.values,
  }))

  slide.addChart(chartData.type, pptxChartData, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: chartWidth,
    h: chartHeight,
    showLegend: chartData.showLegend !== false,
    showTitle: chartData.showTitle !== false,
    title: chartData.title || '',
    titleFontSize: 18,
    titleColor: context.theme.primaryColor.replace('#', ''),
    chartColors: [
      context.theme.primaryColor.replace('#', ''),
      context.theme.secondaryColor.replace('#', ''),
      '10B981', // green
      'F59E0B', // amber
      'EF4444', // red
    ],
    valAxisLabelFontSize: 12,
    catAxisLabelFontSize: 12,
    dataLabelFontSize: 11,
    showValue: true,
  })

  return { height: chartHeight + 0.3 }
}

/**
 * Создаёт данные для bar chart из массива значений
 */
export function createBarChart(
  labels: string[],
  values: number[],
  title?: string
): ChartData {
  return {
    type: 'bar',
    title,
    data: [
      {
        name: 'Items',
        labels,
        values,
      },
    ],
  }
}

/**
 * Создаёт данные для pie chart
 */
export function createPieChart(
  labels: string[],
  values: number[],
  title?: string
): ChartData {
  return {
    type: 'pie',
    title,
    showLegend: true,
    data: [
      {
        name: 'Distribution',
        labels,
        values,
      },
    ],
  }
}

/**
 * Создаёт данные для line chart (тренд)
 */
export function createLineChart(
  series: { name: string; values: number[] }[],
  labels: string[],
  title?: string
): ChartData {
  return {
    type: 'line',
    title,
    data: series.map(s => ({
      name: s.name,
      labels,
      values: s.values,
    })),
  }
}
