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
    context.contentWidth
  )

  const totalHeight = Math.max(0.5, height + 0.2)

  // Добавляем текст как один элемент — bold italic
  slide.addText(fullText, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: totalHeight,
    fontSize: context.slideStyle.bodyFontSize,
    color: hexToColor(context.theme.textColor),
    bold: true,
    italic: true,
    valign: 'top',
    lineSpacing: context.slideStyle.lineSpacing * context.slideStyle.bodyFontSize,
  })

  return { height: totalHeight + 0.2 }
}
