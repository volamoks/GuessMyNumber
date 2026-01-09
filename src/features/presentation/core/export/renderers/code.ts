/**
 * Рендерер для блоков кода
 */

import type PptxGenJS from 'pptxgenjs'
import type { CodeBlockNode } from '../../types/ast'
import type { RenderContext, RenderResult } from '../../types/export'
import { hexToColor } from './base'
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

  // Определяем цвета
  const isDark = context.theme.id === 'dark' || context.theme.backgroundColor.toLowerCase().includes('1e293b')
  const codeBg = context.theme.codeBackgroundColor ? hexToColor(context.theme.codeBackgroundColor) : (isDark ? '1F2937' : '1F2937') // Default to dark bg for code
  const codeText = context.theme.codeTextColor ? hexToColor(context.theme.codeTextColor) : 'E2E8F0'
  const borderColor = context.theme.borderColor ? hexToColor(context.theme.borderColor) : '475569'

  slide.addText(code, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: height,
    fontSize: context.slideStyle.codeFontSize,
    color: codeText,
    fill: { color: codeBg },
    line: { color: borderColor, width: 1 },
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
      fontSize: 7, // Уменьшено с 9 на 25%
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
export function renderInlineCode(text: string): string {
  // Для inline кода просто возвращаем текст с маркерами
  // Настоящее форматирование происходит в TextRuns
  return text
}
