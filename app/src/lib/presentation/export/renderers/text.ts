/**
 * Рендерер для текстовых элементов (параграфы, заголовки)
 */

import type PptxGenJS from 'pptxgenjs'
import type { HeadingNode, ParagraphNode } from '../../types/ast'
import type { RenderContext, RenderResult } from '../../types/export'
import { inlineNodesToTextRuns, hexToColor, calculateTextHeight } from './base'

/**
 * Рендерит заголовок
 */
export function renderHeading(
  slide: PptxGenJS.Slide,
  node: HeadingNode,
  context: RenderContext
): RenderResult {
  const fontSizes: Record<number, number> = {
    1: 36,
    2: 30,
    3: 26,
    4: 22,
    5: 20,
    6: 18,
  }

  const fontSize = fontSizes[node.level] || 18
  const textRuns = inlineNodesToTextRuns(node.children, context.theme)

  // Переопределяем цвет для заголовков
  for (const run of textRuns) {
    if (run.options) {
      run.options.color = hexToColor(context.theme.primaryColor)
      run.options.bold = true
    }
  }

  const textContent = textRuns.map(r => r.text).join('')
  const height = calculateTextHeight(textContent, fontSize, 1.2, context.contentWidth)

  slide.addText(textRuns, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: height + 0.2,
    fontSize,
    bold: true,
    color: hexToColor(context.theme.primaryColor),
    fontFace: context.theme.fontFamily.split(',')[0].trim(),
    valign: 'top',
  })

  return { height: height + 0.3 }
}

/**
 * Рендерит параграф
 */
export function renderParagraph(
  slide: PptxGenJS.Slide,
  node: ParagraphNode,
  context: RenderContext
): RenderResult {
  const textRuns = inlineNodesToTextRuns(node.children, context.theme)
  const textContent = textRuns.map(r => r.text).join('')
  const height = calculateTextHeight(
    textContent,
    context.slideStyle.bodyFontSize,
    context.slideStyle.lineSpacing,
    context.contentWidth
  )

  slide.addText(textRuns, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: height + 0.1,
    fontSize: context.slideStyle.bodyFontSize,
    color: hexToColor(context.theme.textColor),
    fontFace: context.theme.fontFamily.split(',')[0].trim(),
    valign: 'top',
    lineSpacing: context.slideStyle.lineSpacing * context.slideStyle.bodyFontSize,
  })

  return { height: height + 0.2 }
}
