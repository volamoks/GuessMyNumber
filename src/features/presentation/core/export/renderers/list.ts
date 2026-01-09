/**
 * Рендерер для списков
 */

import type PptxGenJS from 'pptxgenjs'
import type { ListNode, ListItemNode, ParagraphNode } from '../../types/ast'
import type { RenderContext, RenderResult } from '../../types/export'
import { hexToColor, inlineNodesToTextRuns } from './base'

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
    lineSpacing: context.slideStyle.lineSpacing * context.slideStyle.bodyFontSize,
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
): PptxGenJS.TextProps[] {
  const items: PptxGenJS.TextProps[] = []

  for (let i = 0; i < list.items.length; i++) {
    const item = list.items[i]

    // PptxGenJS bullet format
    const bulletConfig: PptxGenJS.TextPropsOptions['bullet'] = list.ordered
      ? { type: 'number' }
      : true

    // Извлекаем текстовые runs из элемента списка
    const runs = extractListItemRuns(item, context)

    // Если есть checkbox, добавляем его к первому run
    if (item.checked !== undefined) {
      const checkbox = item.checked ? '☑ ' : '☐ '
      if (runs.length > 0) {
        runs[0].text = checkbox + runs[0].text
      } else {
        runs.push({ text: checkbox, options: {} })
      }
    }

    // Применяем настройки списка к runs
    runs.forEach((run, index) => {
      if (!run.options) run.options = {}

      // Bullet только для первого run в элементе
      if (index === 0) {
        run.options.bullet = bulletConfig
      }

      run.options.indentLevel = indentLevel
      run.options.fontSize = context.slideStyle.bodyFontSize

      // Если цвет не задан явно (например для ссылок), используем цвет текста темы
      if (!run.options.color) {
        run.options.color = hexToColor(context.theme.textColor)
      }

      // Добавляем перенос строки для последнего run
      if (index === runs.length - 1) {
        run.options.breakLine = true
      }
    })

    items.push(...runs)

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
 * Извлекает TextRuns из элемента списка
 */
function extractListItemRuns(item: ListItemNode, context: RenderContext): PptxGenJS.TextProps[] {
  for (const child of item.children) {
    if (child.type === 'paragraph') {
      return inlineNodesToTextRuns((child as ParagraphNode).children, context.theme)
    }
  }

  // Fallback - если нет параграфа, возвращаем пустой массив или текст
  return []
}

/**
 * Извлекает текст из элемента списка
 */

