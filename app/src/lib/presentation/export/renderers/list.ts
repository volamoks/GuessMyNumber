/**
 * Рендерер для списков
 */

import type PptxGenJS from 'pptxgenjs'
import type { ListNode, ListItemNode, BlockNode, ParagraphNode } from '../../types/ast'
import type { RenderContext, RenderResult } from '../../types/export'
import { inlineNodesToTextRuns, extractTextFromNodes, hexToColor } from './base'

interface BulletTextItem {
  text: string
  options: {
    bullet: boolean | { type?: string; code?: string }
    indentLevel?: number
    color?: string
    fontSize?: number
    fontFace?: string
  }
}

/**
 * Рендерит список (ordered или unordered)
 */
export function renderList(
  slide: PptxGenJS.Slide,
  node: ListNode,
  context: RenderContext,
  indentLevel: number = 0
): RenderResult {
  const bulletItems = flattenListItems(node, context, indentLevel)

  if (bulletItems.length === 0) {
    return { height: 0 }
  }

  const itemHeight = 0.4
  const totalHeight = bulletItems.length * itemHeight + 0.2

  slide.addText(bulletItems, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: totalHeight,
    fontSize: context.slideStyle.bodyFontSize,
    color: hexToColor(context.theme.textColor),
    fontFace: context.theme.fontFamily.split(',')[0].trim(),
    lineSpacing: 28,
    valign: 'top',
  })

  return { height: totalHeight + 0.1 }
}

/**
 * Преобразует вложенный список в плоский массив элементов с уровнями отступа
 */
function flattenListItems(
  list: ListNode,
  context: RenderContext,
  indentLevel: number
): BulletTextItem[] {
  const items: BulletTextItem[] = []

  for (let i = 0; i < list.items.length; i++) {
    const item = list.items[i]

    // PptxGenJS bullet format
    const bulletConfig = list.ordered
      ? { type: 'number' as const }
      : true

    // Извлекаем текст из первого параграфа элемента списка
    const text = extractListItemText(item)

    // Добавляем checkbox статус для task lists
    let displayText = text
    if (item.checked !== undefined) {
      displayText = (item.checked ? '☑ ' : '☐ ') + text
    }

    items.push({
      text: displayText,
      options: {
        bullet: bulletConfig,
        indentLevel: indentLevel,
        color: hexToColor(context.theme.textColor),
        fontSize: context.slideStyle.bodyFontSize,
        fontFace: context.theme.fontFamily.split(',')[0].trim(),
      },
    })

    // Рекурсивно обрабатываем вложенные списки
    for (const child of item.children) {
      if (child.type === 'list') {
        const nestedItems = flattenListItems(child as ListNode, context, indentLevel + 1)
        items.push(...nestedItems)
      }
    }
  }

  return items
}

/**
 * Извлекает текст из элемента списка
 */
function extractListItemText(item: ListItemNode): string {
  for (const child of item.children) {
    if (child.type === 'paragraph') {
      return extractTextFromNodes((child as ParagraphNode).children)
    }
  }

  // Fallback - берём первый текстовый элемент
  return item.children
    .map(child => {
      if (child.type === 'paragraph') {
        return extractTextFromNodes((child as ParagraphNode).children)
      }
      return ''
    })
    .join(' ')
    .trim()
}
