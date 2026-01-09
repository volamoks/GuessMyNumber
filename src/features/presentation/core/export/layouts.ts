/**
 * Custom layouts для специальных типов слайдов
 */

import type PptxGenJS from 'pptxgenjs'
import type { PresentationTheme } from '../types/theme'

export type CustomLayoutType =
  | 'roadmap-three-column'
  | 'canvas-grid'
  | 'two-column'
  | 'title-only'
  | 'content-with-sidebar'

/**
 * Определяет кастомные мастер-слайды
 */
export function defineCustomLayouts(pptx: PptxGenJS, theme: PresentationTheme): void {
  // Roadmap layout - 3 колонки (Now, Next, Later)
  pptx.defineSlideMaster({
    title: 'ROADMAP_THREE_COLUMN',
    background: { color: theme.backgroundColor.replace('#', '') },
    objects: [
      // Вертикальные разделители
      {
        line: {
          x: 3.33,
          y: 1.5,
          w: 0,
          h: 3.5,
          line: { color: theme.textColor.replace('#', '') + '20', width: 1 },
        },
      },
      {
        line: {
          x: 6.66,
          y: 1.5,
          w: 0,
          h: 3.5,
          line: { color: theme.textColor.replace('#', '') + '20', width: 1 },
        },
      },
    ],
  })

  // Canvas 3x3 grid
  pptx.defineSlideMaster({
    title: 'CANVAS_GRID',
    background: { color: theme.backgroundColor.replace('#', '') },
    objects: [
      // Горизонтальные линии
      {
        line: {
          x: 0.5,
          y: 2.375,
          w: 9,
          h: 0,
          line: { color: theme.textColor.replace('#', '') + '20', width: 1 },
        },
      },
      {
        line: {
          x: 0.5,
          y: 3.625,
          w: 9,
          h: 0,
          line: { color: theme.textColor.replace('#', '') + '20', width: 1 },
        },
      },
      // Вертикальные линии
      {
        line: {
          x: 3.5,
          y: 1.125,
          w: 0,
          h: 3.75,
          line: { color: theme.textColor.replace('#', '') + '20', width: 1 },
        },
      },
      {
        line: {
          x: 6.5,
          y: 1.125,
          w: 0,
          h: 3.75,
          line: { color: theme.textColor.replace('#', '') + '20', width: 1 },
        },
      },
    ],
  })

  // Two column layout
  pptx.defineSlideMaster({
    title: 'TWO_COLUMN',
    background: { color: theme.backgroundColor.replace('#', '') },
    objects: [
      {
        line: {
          x: 5,
          y: 1.5,
          w: 0,
          h: 3.5,
          line: { color: theme.textColor.replace('#', '') + '20', width: 1 },
        },
      },
    ],
  })

  // Title only (для больших изображений/диаграмм)
  pptx.defineSlideMaster({
    title: 'TITLE_ONLY',
    background: { color: theme.backgroundColor.replace('#', '') },
  })

  // Content with sidebar (70/30 split)
  pptx.defineSlideMaster({
    title: 'CONTENT_SIDEBAR',
    background: { color: theme.backgroundColor.replace('#', '') },
    objects: [
      {
        line: {
          x: 7,
          y: 1.5,
          w: 0,
          h: 3.5,
          line: { color: theme.textColor.replace('#', '') + '20', width: 1 },
        },
      },
      // Sidebar background
      {
        rect: {
          x: 7,
          y: 1.125,
          w: 2.5,
          h: 4.375,
          fill: { color: theme.backgroundColor === '#ffffff' ? 'F8FAFC' : '1E293B' },
        },
      },
    ],
  })
}

/**
 * Возвращает layout по типу
 */
export function getLayoutName(type: CustomLayoutType): string {
  const map: Record<CustomLayoutType, string> = {
    'roadmap-three-column': 'ROADMAP_THREE_COLUMN',
    'canvas-grid': 'CANVAS_GRID',
    'two-column': 'TWO_COLUMN',
    'title-only': 'TITLE_ONLY',
    'content-with-sidebar': 'CONTENT_SIDEBAR',
  }
  return map[type]
}

/**
 * Возвращает координаты для колонок в roadmap layout
 */
export function getRoadmapColumnPositions(): Array<{ x: number; y: number; w: number; h: number }> {
  return [
    { x: 0.5, y: 1.5, w: 2.8, h: 3.5 }, // Now
    { x: 3.4, y: 1.5, w: 2.8, h: 3.5 }, // Next
    { x: 6.8, y: 1.5, w: 2.8, h: 3.5 }, // Later
  ]
}

/**
 * Возвращает координаты для ячеек в canvas grid (3x3)
 */
export function getCanvasGridPositions(): Array<Array<{ x: number; y: number; w: number; h: number }>> {
  const cellWidth = 3
  const cellHeight = 1.25

  return [
    // Row 1
    [
      { x: 0.5, y: 1.125, w: cellWidth, h: cellHeight },
      { x: 3.5, y: 1.125, w: cellWidth, h: cellHeight },
      { x: 6.5, y: 1.125, w: cellWidth, h: cellHeight },
    ],
    // Row 2
    [
      { x: 0.5, y: 2.375, w: cellWidth, h: cellHeight },
      { x: 3.5, y: 2.375, w: cellWidth, h: cellHeight },
      { x: 6.5, y: 2.375, w: cellWidth, h: cellHeight },
    ],
    // Row 3
    [
      { x: 0.5, y: 3.625, w: cellWidth, h: cellHeight },
      { x: 3.5, y: 3.625, w: cellWidth, h: cellHeight },
      { x: 6.5, y: 3.625, w: cellWidth, h: cellHeight },
    ],
  ]
}

/**
 * Возвращает координаты для two-column layout
 */
export function getTwoColumnPositions(): Array<{ x: number; y: number; w: number; h: number }> {
  return [
    { x: 0.5, y: 1.5, w: 4.25, h: 3.5 }, // Left
    { x: 5.25, y: 1.5, w: 4.25, h: 3.5 }, // Right
  ]
}
