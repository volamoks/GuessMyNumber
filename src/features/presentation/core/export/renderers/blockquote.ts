/**
 * Рендерер для цитат (blockquote)
 */

import type PptxGenJS from 'pptxgenjs'
import type { BlockquoteNode, ParagraphNode } from '../../types/ast'
import type { RenderContext, RenderResult } from '../../types/export'
import { extractTextFromNodes, hexToColor, calculateTextHeight } from './base'

/**
 * Рендерит блок цитаты
 */
export function renderBlockquote(
  slide: PptxGenJS.Slide,
  node: BlockquoteNode,
  context: RenderContext
): RenderResult {
  // Извлекаем текст из всех параграфов в blockquote
  const texts: string[] = []

  for (const child of node.children) {
    if (child.type === 'paragraph') {
      texts.push(extractTextFromNodes((child as ParagraphNode).children))
    }
  }

  const fullText = texts.join('\n\n')

  // Рассчитываем высоту
  const height = calculateTextHeight(
    fullText,
    context.slideStyle.bodyFontSize,
    context.slideStyle.lineSpacing,
    context.contentWidth - 0.5 // учитываем padding
  )

  const totalHeight = Math.max(0.8, height + 0.4)

  // Добавляем фон
  slide.addShape('rect', {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: totalHeight,
    fill: { color: 'F3F4F6' },
  })

  // Добавляем акцентную полосу слева
  slide.addShape('rect', {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: 0.05, // Тонкая полоска
    h: totalHeight,
    fill: { color: hexToColor(context.theme.primaryColor) },
  })

  // Добавляем текст поверх фона
  slide.addText(fullText, {
    x: context.slideStyle.padding + 0.3,
    y: context.currentY + 0.15,
    w: context.contentWidth - 0.5,
    h: totalHeight - 0.3,
    fontSize: context.slideStyle.bodyFontSize,
    color: hexToColor(context.theme.textColor),
    transparency: 20, // ~CC is 80% opacity, so 20% transparency
    italic: true,
    valign: 'top',
    lineSpacing: context.slideStyle.lineSpacing * context.slideStyle.bodyFontSize,
  })

  return { height: totalHeight + 0.2 }
}
