import PptxGenJS from 'pptxgenjs'
import type { CanvasNode } from '../../types/ast'
import type { RenderContext } from '../../types/export'
import { createCell, createHeaderCell, getThemeColors } from '../helpers/table-utils'

export function renderCanvas(
    slide: PptxGenJS.Slide,
    node: CanvasNode,
    context: RenderContext
): { height: number } {
    const { data, canvasType } = node
    let { currentY, contentWidth, slideHeight, theme, slideStyle } = context

    // Safeguard against invalid width
    if (!contentWidth || isNaN(contentWidth) || contentWidth <= 0) {
        contentWidth = 9 // Safe default (10 - 0.5*2)
    }

    // Use remaining height for the canvas
    const availableHeight = slideHeight - currentY - 0.5
    const startY = currentY
    const startX = slideStyle.padding

    // Define grid layout based on canvas type
    if (canvasType === 'business_model_canvas') {
        renderBusinessCanvas(slide, data, startX, startY, contentWidth, availableHeight, theme)
    } else if (canvasType === 'lean_canvas') {
        renderLeanCanvas(slide, data, startX, startY, contentWidth, availableHeight, theme)
    } else if (canvasType === 'cjm') {
        renderCJM(slide, data, startX, startY, contentWidth, availableHeight, theme)
    }

    return { height: availableHeight }
}

function renderBusinessCanvas(
    slide: PptxGenJS.Slide,
    data: any,
    x: number,
    y: number,
    width: number,
    height: number,
    theme: any
) {
    const colors = getThemeColors(theme)

    const createCanvasCell = (title: string, items: string[], rowSpan: number = 1, colSpan: number = 2): PptxGenJS.TableCell => {
        const textRuns = [
            { text: title + '\n', options: { bold: true, color: colors.primary, fontSize: 10, breakLine: true } }
        ]
        if (items && items.length > 0) {
            textRuns.push({
                text: items.map(i => `• ${i}`).join('\n'),
                options: { color: colors.text, fontSize: 9, breakLine: true, bold: false }
            })
        }
        return createCell(textRuns, theme, {
            rowspan: rowSpan,
            colspan: colSpan,
            fill: colors.cellFill,
            border: { type: 'solid', pt: 1, color: colors.borderColor },
            valign: 'top'
        })
    }

    // Row 1: KP(2,2), KA(2,1), VP(2,2), CR(2,1), CS(2,2)
    const row1 = [
        createCanvasCell('Key Partners', data.keyPartners, 2, 2),
        createCanvasCell('Key Activities', data.keyActivities, 1, 2),
        createCanvasCell('Value Propositions', data.valueProposition, 2, 2),
        createCanvasCell('Customer Relationships', data.customerRelationships, 1, 2),
        createCanvasCell('Customer Segments', data.customerSegments, 2, 2)
    ]

    // Row 2: KR(2,1), CH(2,1) - occupying the gaps left by KA and CR
    const row2 = [
        createCanvasCell('Key Resources', data.keyResources, 1, 2),
        createCanvasCell('Channels', data.channels, 1, 2)
    ]

    // Row 3: Cost(5,1), Revenue(5,1)
    const row3 = [
        createCanvasCell('Cost Structure', data.costStructure, 1, 5),
        createCanvasCell('Revenue Streams', data.revenueStreams, 1, 5)
    ]

    slide.addTable([row1, row2, row3], {
        x, y, w: width, h: height,
        colW: Array(10).fill(width / 10)
    })
}

function renderLeanCanvas(
    slide: PptxGenJS.Slide,
    data: any,
    x: number,
    y: number,
    width: number,
    height: number,
    theme: any
) {
    const colors = getThemeColors(theme)

    const createCanvasCell = (title: string, items: string[], rowSpan: number = 1, colSpan: number = 2): PptxGenJS.TableCell => {
        const textRuns = [
            { text: title + '\n', options: { bold: true, color: colors.primary, fontSize: 10, breakLine: true } }
        ]
        if (items && items.length > 0) {
            textRuns.push({
                text: items.map(i => `• ${i}`).join('\n'),
                options: { color: colors.text, fontSize: 9, breakLine: true, bold: false }
            })
        }
        return createCell(textRuns, theme, {
            rowspan: rowSpan,
            colspan: colSpan,
            fill: colors.cellFill,
            border: { type: 'solid', pt: 1, color: colors.borderColor },
            valign: 'top'
        })
    }

    // Row 1: Problem(2,2), Solution(2,1), UVP(2,2), UnfairAdv(2,1), Segments(2,2)
    const row1 = [
        createCanvasCell('Problem', data.problem, 2, 2),
        createCanvasCell('Solution', data.solution, 1, 2),
        createCanvasCell('Unique Value Prop', data.uniqueValueProposition, 2, 2),
        createCanvasCell('Unfair Advantage', data.unfairAdvantage, 1, 2),
        createCanvasCell('Customer Segments', data.customerSegments, 2, 2)
    ]

    // Row 2: KeyMetrics(2,1), Channels(2,1)
    const row2 = [
        createCanvasCell('Key Metrics', data.keyMetrics, 1, 2),
        createCanvasCell('Channels', data.channels, 1, 2)
    ]

    // Row 3: Cost(5,1), Revenue(5,1)
    const row3 = [
        createCanvasCell('Cost Structure', data.costStructure, 1, 5),
        createCanvasCell('Revenue Streams', data.revenueStreams, 1, 5)
    ]

    slide.addTable([row1, row2, row3], {
        x, y, w: width, h: height,
        colW: Array(10).fill(width / 10)
    })
}

function renderCJM(
    slide: PptxGenJS.Slide,
    data: any,
    x: number,
    y: number,
    width: number,
    height: number,
    theme: any
) {
    const stages = data.stages || []
    if (stages.length === 0) return

    // Row 1: Headers (Stage Names)
    const headerRow: PptxGenJS.TableCell[] = stages.map((stage: any) =>
        createHeaderCell(stage.name, theme)
    )

    // Row 2: Goals
    const goalsRow: PptxGenJS.TableCell[] = stages.map((stage: any) => {
        const items = stage.customerGoals || []
        const text = items.length ? 'Goals:\n' + items.map((i: string) => `• ${i}`).join('\n') : ''
        return createCell(text, theme, { fontSize: 8 })
    })

    // Row 3: Activities
    const activitiesRow: PptxGenJS.TableCell[] = stages.map((stage: any) => {
        const items = stage.customerActivities || []
        const text = items.length ? 'Activities:\n' + items.map((i: string) => `• ${i}`).join('\n') : ''
        return createCell(text, theme, { fontSize: 8 })
    })

    // Row 4: Experience
    const experienceRow: PptxGenJS.TableCell[] = stages.map((stage: any) => {
        const items = stage.experience || []
        const text = items.join(' ')
        return createCell(text, theme, { fontSize: 14, align: 'center', valign: 'middle' })
    })

    // Row 5: Pain Points
    const painPointsRow: PptxGenJS.TableCell[] = stages.map((stage: any) => {
        const items = stage.negatives || []
        const text = items.length ? 'Pain Points:\n' + items.map((i: string) => `• ${i}`).join('\n') : ''
        return createCell(text, theme, { fontSize: 8, color: 'FF0000' })
    })

    slide.addTable([headerRow, goalsRow, activitiesRow, experienceRow, painPointsRow], {
        x, y, w: width, h: height,
        colW: Array(stages.length).fill(width / stages.length)
    })
}
