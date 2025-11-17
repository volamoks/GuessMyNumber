/**
 * Рендерер для таблиц
 */

import type PptxGenJS from 'pptxgenjs'
import type { TableNode } from '../../types/ast'
import type { RenderContext, RenderResult } from '../../types/export'
import { extractTextFromNodes, hexToColor } from './base'

/**
 * Рендерит таблицу
 */
export function renderTable(
  slide: PptxGenJS.Slide,
  node: TableNode,
  context: RenderContext
): RenderResult {
  // Конвертируем AST таблицу в формат PptxGenJS
  const tableData: PptxGenJS.TableCell[][] = []

  // Заголовки
  const headerRow: PptxGenJS.TableCell[] = node.headers.map((cell, colIndex) => ({
    text: extractTextFromNodes(cell.children),
    options: {
      bold: true,
      fill: { color: 'E5E7EB' },
      color: hexToColor(context.theme.textColor),
      align: node.alignment?.[colIndex] || 'left',
      valign: 'middle',
    },
  }))
  tableData.push(headerRow)

  // Строки данных
  for (let rowIndex = 0; rowIndex < node.rows.length; rowIndex++) {
    const row = node.rows[rowIndex]
    const dataRow: PptxGenJS.TableCell[] = row.cells.map((cell, colIndex) => ({
      text: extractTextFromNodes(cell.children),
      options: {
        color: hexToColor(context.theme.textColor),
        align: node.alignment?.[colIndex] || 'left',
        valign: 'middle',
        fill: rowIndex % 2 === 1 ? { color: 'F9FAFB' } : undefined,
      },
    }))
    tableData.push(dataRow)
  }

  // Рассчитываем высоту таблицы
  const rowHeight = 0.4
  const totalHeight = tableData.length * rowHeight + 0.2

  // Добавляем таблицу на слайд
  slide.addTable(tableData, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: totalHeight,
    border: { type: 'solid', pt: 1, color: 'D1D5DB' },
    fontFace: context.theme.fontFamily.split(',')[0].trim(),
    fontSize: context.slideStyle.bodyFontSize - 2,
    autoPage: false,
    margin: 0.1,
  })

  return { height: totalHeight + 0.2 }
}

/**
 * Рендерит таблицу из 2D массива строк (упрощённый вариант)
 */
export function renderTableFromArray(
  slide: PptxGenJS.Slide,
  data: string[][],
  context: RenderContext,
  hasHeader: boolean = true
): RenderResult {
  if (data.length === 0) {
    return { height: 0 }
  }

  const tableData: PptxGenJS.TableCell[][] = data.map((row, rowIndex) => {
    const isHeader = hasHeader && rowIndex === 0
    return row.map(cellText => ({
      text: cellText,
      options: {
        bold: isHeader,
        fill: isHeader
          ? { color: 'E5E7EB' }
          : rowIndex % 2 === 0
            ? { color: 'F9FAFB' }
            : undefined,
        color: hexToColor(context.theme.textColor),
        valign: 'middle' as const,
      },
    }))
  })

  const rowHeight = 0.4
  const totalHeight = tableData.length * rowHeight + 0.2

  slide.addTable(tableData, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: totalHeight,
    border: { type: 'solid', pt: 1, color: 'D1D5DB' },
    fontFace: context.theme.fontFamily.split(',')[0].trim(),
    fontSize: context.slideStyle.bodyFontSize - 2,
    autoPage: false,
    margin: 0.1,
  })

  return { height: totalHeight + 0.2 }
}
