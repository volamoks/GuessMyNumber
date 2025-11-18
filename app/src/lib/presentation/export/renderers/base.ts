/**
 * Базовые утилиты для рендеринга в PPTX
 */

import type PptxGenJS from 'pptxgenjs'
import type { InlineNode, TextNode } from '../../types/ast'
import type { RenderContext, ElementPosition } from '../../types/export'
import type { PresentationTheme } from '../../types/theme'

export type TextRun = PptxGenJS.TextProps

/**
 * Конвертирует inline nodes в массив TextRun для PptxGenJS
 */
export function inlineNodesToTextRuns(nodes: InlineNode[], theme: PresentationTheme): TextRun[] {
  const runs: TextRun[] = []

  for (const node of nodes) {
    switch (node.type) {
      case 'text': {
        const textNode = node as TextNode
        const options: TextRun['options'] = {
          color: theme.textColor.replace('#', ''),
        }

        if (textNode.marks) {
          for (const mark of textNode.marks) {
            if (mark.type === 'bold') options.bold = true
            if (mark.type === 'italic') options.italic = true
            if (mark.type === 'strikethrough') options.strike = true
            if (mark.type === 'underline') options.underline = { style: 'sng' }
          }
        }

        runs.push({ text: textNode.value, options })
        break
      }
      case 'link': {
        // PptxGenJS doesn't support hyperlinks in text run arrays
        // Render as colored underlined text with URL visible
        const linkText = extractTextFromNodes(node.children)
        const url = node.url

        // Show link text
        runs.push({
          text: linkText,
          options: {
            color: theme.primaryColor.replace('#', ''),
            underline: { style: 'sng' },
          },
        })

        // Add URL in parentheses if different from text
        if (url !== linkText && !linkText.includes(url)) {
          runs.push({
            text: ` (${url})`,
            options: {
              color: '9CA3AF',
              fontSize: 14,
            },
          })
        }
        break
      }
      case 'code_inline':
        runs.push({
          text: node.value,
          options: {
            fontFace: theme.codeFontFamily.split(',')[0].trim(),
            color: 'E74C3C',
          },
        })
        break
      case 'image':
        // Изображения в inline контексте - просто показываем alt текст
        runs.push({
          text: `[${node.alt || 'Image'}]`,
          options: {
            color: '9CA3AF',
          },
        })
        break
    }
  }

  return runs
}

/**
 * Извлекает plain text из inline nodes
 */
export function extractTextFromNodes(nodes: InlineNode[]): string {
  return nodes
    .map(node => {
      if (node.type === 'text') return node.value
      if (node.type === 'link') return extractTextFromNodes(node.children)
      if (node.type === 'code_inline') return node.value
      if (node.type === 'image') return node.alt || ''
      return ''
    })
    .join('')
}

/**
 * Рассчитывает позицию элемента на слайде
 */
export function calculatePosition(
  context: RenderContext,
  height: number
): ElementPosition {
  return {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: height,
  }
}

/**
 * Конвертирует цвет из HEX в формат PptxGenJS (без #)
 */
export function hexToColor(hex: string): string {
  return hex.replace('#', '')
}

/**
 * Рассчитывает высоту текста на основе количества строк
 */
export function calculateTextHeight(
  text: string,
  fontSize: number,
  lineSpacing: number,
  availableWidth: number
): number {
  // Примерная оценка: ~10 символов на дюйм при fontSize 18
  const charsPerInch = (18 / fontSize) * 10
  const charsPerLine = availableWidth * charsPerInch

  const lines = text.split('\n')
  let totalLines = 0

  for (const line of lines) {
    if (line.length === 0) {
      totalLines += 1
    } else {
      totalLines += Math.ceil(line.length / charsPerLine)
    }
  }

  // Высота одной строки в дюймах
  const lineHeight = (fontSize / 72) * lineSpacing
  return totalLines * lineHeight
}
