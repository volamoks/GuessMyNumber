/**
 * Рендерер для блоков кода
 */

import type PptxGenJS from 'pptxgenjs'
import type { CodeBlockNode } from '../../types/ast'
import type { RenderContext, RenderResult } from '../../types/export'
import { hexToColor, calculateTextHeight } from './base'

/**
 * Рендерит блок кода
 */
export function renderCodeBlock(
  slide: PptxGenJS.Slide,
  node: CodeBlockNode,
  context: RenderContext
): RenderResult {
  const code = node.value
  const lines = code.split('\n')

  // Рассчитываем высоту на основе количества строк
  const lineHeight = (context.slideStyle.codeFontSize / 72) * 1.4
  const minHeight = 0.6
  const calculatedHeight = Math.max(minHeight, lines.length * lineHeight + 0.4)

  // Ограничиваем максимальную высоту
  const maxHeight = context.slideHeight - context.currentY - context.slideStyle.padding - 0.5
  const height = Math.min(calculatedHeight, maxHeight)

  slide.addText(code, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: height,
    fontSize: context.slideStyle.codeFontSize,
    fontFace: context.theme.codeFontFamily.split(',')[0].trim(),
    color: 'E2E8F0', // Светлый текст
    fill: { color: '1E293B' }, // Тёмный фон
    line: { color: '475569', width: 1 },
    margin: [0.15, 0.25, 0.15, 0.25], // top, left, bottom, right
    valign: 'top',
    lineSpacing: context.slideStyle.codeFontSize * 1.4,
    paraSpaceAfter: 0,
    paraSpaceBefore: 0,
  })

  // Добавляем метку языка если есть
  if (node.language) {
    slide.addText(node.language, {
      x: context.slideStyle.padding + context.contentWidth - 1,
      y: context.currentY + 0.05,
      w: 0.95,
      h: 0.25,
      fontSize: 9,
      color: '94A3B8',
      align: 'right',
      valign: 'top',
    })
  }

  return { height: height + 0.2 }
}

/**
 * Рендерит inline код в тексте
 */
export function renderInlineCode(text: string, theme: { codeFontFamily: string }): string {
  // Для inline кода просто возвращаем текст с маркерами
  // Настоящее форматирование происходит в TextRuns
  return text
}
