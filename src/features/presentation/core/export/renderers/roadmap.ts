import PptxGenJS from 'pptxgenjs'
import type { RoadmapNode } from '../../types/ast'
import type { RenderContext } from '../../types/export'
import { createCell, createHeaderCell, getThemeColors } from '../helpers/table-utils'

export function renderRoadmap(
    slide: PptxGenJS.Slide,
    node: RoadmapNode,
    context: RenderContext
): { height: number } {
    const { data } = node
    let { currentY, contentWidth, slideHeight, theme, slideStyle } = context

    // Safeguard against invalid width
    if (!contentWidth || isNaN(contentWidth) || contentWidth <= 2) {
        contentWidth = 9 // Safe default
    }

    const availableHeight = slideHeight - currentY - 0.5
    const startY = currentY
    const startX = slideStyle.padding

    // Columns: NOW, NEXT, LATER
    const columns = [
        { title: 'NOW', items: data.now || [] },
        { title: 'NEXT', items: data.next || [] },
        { title: 'LATER', items: data.later || [] }
    ]

    const colors = getThemeColors(theme)

    // Create table data
    const tableData: PptxGenJS.TableCell[][] = []

    // Header Row
    const headerRow: PptxGenJS.TableCell[] = columns.map(col =>
        createHeaderCell(col.title, theme)
    )
    tableData.push(headerRow)

    // Content Row (one big cell per column containing all items)
    const contentRow: PptxGenJS.TableCell[] = columns.map(col => {
        const textRuns: any[] = []
        col.items.forEach((item: any, index: number) => {
            const priorityColor = item.priority === 'high' ? 'FF0000' : item.priority === 'medium' ? 'FFA500' : '008000'

            // Add spacing between items
            if (index > 0) {
                textRuns.push({ text: '\n\n', options: { fontSize: 6, breakLine: true, bold: false } })
            }

            textRuns.push({ text: item.title, options: { bold: true, color: colors.text, fontSize: 10, breakLine: true } })
            textRuns.push({ text: item.priority.toUpperCase(), options: { color: priorityColor, fontSize: 8, breakLine: true, bold: false } })

            if (item.description) {
                textRuns.push({ text: item.description, options: { color: colors.text, fontSize: 8, breakLine: true, bold: false } })
            }
        })

        return createCell(textRuns, theme, { valign: 'top' })
    })
    tableData.push(contentRow)

    slide.addTable(tableData, {
        x: startX,
        y: startY,
        w: contentWidth,
        h: availableHeight,
        colW: Array(3).fill(contentWidth / 3)
    })

    return { height: availableHeight }
}
