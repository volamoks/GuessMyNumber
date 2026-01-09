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

  // Определяем цвета в зависимости от темы
  const isDark = context.theme.id === 'dark' || context.theme.backgroundColor.toLowerCase().includes('1e293b')

  const headerFill = hexToColor(context.theme.primaryColor)
  const rowAltFill = context.theme.codeBackgroundColor ? hexToColor(context.theme.codeBackgroundColor) : (isDark ? '1F2937' : 'F9FAFB')
  const borderColor = context.theme.borderColor ? hexToColor(context.theme.borderColor) : (isDark ? '4B5563' : 'D1D5DB')

  // Заголовки
  const headerRow: PptxGenJS.TableCell[] = node.headers.map((cell, colIndex) => ({
    text: extractTextFromNodes(cell.children),
    options: {
      bold: true,
      fill: { color: headerFill },
      color: 'FFFFFF', // Always white text on primary color header
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
        fill: rowIndex % 2 === 1 ? { color: rowAltFill } : undefined,
      },
    }))
    tableData.push(dataRow)
  }

  // Рассчитываем высоту таблицы
  const rowHeight = 0.4
  const totalHeight = tableData.length * rowHeight + 0.2

  // Рассчитываем ширину колонок
  const numCols = node.headers.length || (node.rows.length > 0 ? node.rows[0].cells.length : 1)
  const colWidth = context.contentWidth / numCols
  const colW = Array(numCols).fill(colWidth)

  // Добавляем таблицу на слайд
  slide.addTable(tableData, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    colW: colW,
    border: { type: 'solid', pt: 1, color: borderColor },
    fontSize: context.slideStyle.bodyFontSize - 2,
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

  // Определяем цвета в зависимости от темы
  const isDark = context.theme.id === 'dark' || context.theme.backgroundColor.toLowerCase().includes('1e293b')
  const headerFill = hexToColor(context.theme.primaryColor)
  const rowAltFill = context.theme.codeBackgroundColor ? hexToColor(context.theme.codeBackgroundColor) : (isDark ? '1F2937' : 'F9FAFB')
  const borderColor = context.theme.borderColor ? hexToColor(context.theme.borderColor) : (isDark ? '4B5563' : 'D1D5DB')

  const tableData: PptxGenJS.TableCell[][] = data.map((row, rowIndex) => {
    const isHeader = hasHeader && rowIndex === 0
    return row.map(cellText => ({
      text: cellText,
      options: {
        bold: isHeader,
        fill: isHeader
          ? { color: headerFill }
          : rowIndex % 2 === 0
            ? { color: rowAltFill }
            : undefined,
        color: isHeader ? 'FFFFFF' : hexToColor(context.theme.textColor),
        valign: 'middle' as const,
      },
    }))
  })

  const rowHeight = 0.4
  const totalHeight = tableData.length * rowHeight + 0.2

  // Рассчитываем ширину колонок
  const numCols = data[0].length
  const colWidth = context.contentWidth / numCols
  const colW = Array(numCols).fill(colWidth)

  slide.addTable(tableData, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    colW: colW,
    border: { type: 'solid', pt: 1, color: borderColor },
    fontSize: context.slideStyle.bodyFontSize - 2,
    margin: 0.1,
  })

  return { height: totalHeight + 0.2 }
}
