/**
 * Рендерер для фигур (shapes)
 */

import type PptxGenJS from 'pptxgenjs'
import type { RenderContext, RenderResult } from '../../types/export'
import { hexToColor } from './base'

export interface ShapeConfig {
  type: 'rect' | 'ellipse' | 'roundRect' | 'triangle' | 'line'
  fill?: string
  line?: {
    color: string
    width: number
    dashType?: 'solid' | 'dash' | 'dot'
  }
  shadow?: boolean
}

/**
 * Рендерит фигуру
 */
export function renderShape(
  slide: PptxGenJS.Slide,
  config: ShapeConfig,
  context: RenderContext,
  width: number,
  height: number
): RenderResult {
  const shapeType = config.type as PptxGenJS.ShapeType

  slide.addShape(shapeType, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: width,
    h: height,
    fill: config.fill ? { color: hexToColor(config.fill) } : undefined,
    line: config.line
      ? {
          color: hexToColor(config.line.color),
          width: config.line.width,
          dashType: config.line.dashType || 'solid',
        }
      : undefined,
    shadow: config.shadow
      ? {
          type: 'outer',
          blur: 3,
          offset: 2,
          angle: 45,
          color: '000000',
          opacity: 0.3,
        }
      : undefined,
  })

  return { height: height + 0.2 }
}

/**
 * Создаёт highlight box вокруг контента
 */
export function renderHighlightBox(
  slide: PptxGenJS.Slide,
  context: RenderContext,
  width: number,
  height: number,
  type: 'info' | 'warning' | 'success' | 'error' = 'info'
): RenderResult {
  const colors = {
    info: context.theme.primaryColor,
    warning: '#F59E0B',
    success: '#10B981',
    error: '#EF4444',
  }

  slide.addShape('roundRect', {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: width,
    h: height,
    fill: { color: hexToColor(colors[type]) + '10' }, // 10% opacity
    line: {
      color: hexToColor(colors[type]),
      width: 2,
    },
    rectRadius: 0.1,
  })

  return { height }
}

/**
 * Рендерит стрелку
 */
export function renderArrow(
  slide: PptxGenJS.Slide,
  context: RenderContext,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color?: string
): void {
  slide.addShape('line', {
    x: fromX,
    y: fromY,
    w: toX - fromX,
    h: toY - fromY,
    line: {
      color: color ? hexToColor(color) : hexToColor(context.theme.primaryColor),
      width: 2,
      endArrowType: 'triangle',
    },
  })
}

/**
 * Рендерит разделитель
 */
export function renderDivider(
  slide: PptxGenJS.Slide,
  context: RenderContext,
  width?: number
): RenderResult {
  const dividerWidth = width || context.contentWidth

  slide.addShape('line', {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: dividerWidth,
    h: 0,
    line: {
      color: hexToColor(context.theme.textColor) + '30', // 30% opacity
      width: 1,
    },
  })

  return { height: 0.3 }
}
