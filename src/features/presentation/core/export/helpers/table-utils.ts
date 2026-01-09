import PptxGenJS from 'pptxgenjs'
import { hexToColor } from '../renderers/base'

interface CellOptions {
    fill?: string
    color?: string
    bold?: boolean
    fontSize?: number
    align?: 'left' | 'center' | 'right'
    valign?: 'top' | 'middle' | 'bottom'
    rowspan?: number
    colspan?: number
    border?: PptxGenJS.BorderOptions
}

export function getThemeColors(theme: any) {
    const isDark = theme.id === 'dark' || theme.backgroundColor.toLowerCase().includes('1e293b')
    return {
        isDark,
        primary: hexToColor(theme.primaryColor),
        text: hexToColor(theme.textColor),
        background: hexToColor(theme.backgroundColor),
        cellFill: theme.codeBackgroundColor ? hexToColor(theme.codeBackgroundColor) : (isDark ? '1F2937' : 'FFFFFF'),
        headerFill: hexToColor(theme.primaryColor),
        borderColor: theme.borderColor ? hexToColor(theme.borderColor) : (isDark ? '374151' : 'D1D5DB'),
        headerText: 'FFFFFF',
    }
}

export function createCell(
    content: string | PptxGenJS.TextProps[],
    theme: any,
    options: CellOptions = {}
): PptxGenJS.TableCell {
    const colors = getThemeColors(theme)

    const defaultOptions: PptxGenJS.TableCellProps = {
        fill: { color: options.fill || colors.cellFill },
        border: options.border || { type: 'solid', pt: 1, color: colors.borderColor },
        valign: options.valign || 'top',
        margin: 0.1,
        rowspan: options.rowspan,
        colspan: options.colspan,
        align: options.align || 'left',
    }

    // If content is a string, wrap it in a TextProps object with default styling
    let textRuns: PptxGenJS.TextProps[] = []
    if (typeof content === 'string') {
        textRuns = [{
            text: content,
            options: {
                color: options.color || colors.text,
                fontSize: options.fontSize || 9,
                bold: options.bold,
                breakLine: true
            }
        }]
    } else {
        textRuns = content
    }

    return {
        text: textRuns,
        options: defaultOptions
    }
}

export function createHeaderCell(
    text: string,
    theme: any,
    options: CellOptions = {}
): PptxGenJS.TableCell {
    const colors = getThemeColors(theme)
    return createCell(text, theme, {
        ...options,
        fill: colors.headerFill,
        color: colors.headerText,
        bold: true,
        align: 'center',
        valign: 'middle',
        fontSize: 10
    })
}
