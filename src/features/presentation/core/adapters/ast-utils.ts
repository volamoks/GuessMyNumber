/**
 * Универсальные утилиты для построения AST узлов в адаптерах
 */

import type { SlideNode, BlockNode, ListNode, ListItemNode, TableNode, TableRowNode, TableCellNode, TextNode } from '../types/ast'

export const generateId = () => Math.random().toString(36).substring(2, 15)

export function createTextNode(value: string, bold = false, italic = false): TextNode {
    const marks: any[] = []
    if (bold) marks.push({ type: 'bold' })
    if (italic) marks.push({ type: 'italic' })

    return {
        type: 'text',
        value,
        marks: marks.length > 0 ? marks : undefined
    }
}

export function createParagraphNode(text: string | TextNode[]): BlockNode {
    return {
        type: 'paragraph',
        children: typeof text === 'string' ? [createTextNode(text)] : text
    }
}

export function createListItemNode(children: BlockNode[], checked?: boolean): ListItemNode {
    return {
        type: 'list_item',
        checked,
        children
    }
}

export function createSimpleListItem(text: string): ListItemNode {
    return createListItemNode([createParagraphNode(text)])
}

export function createListNode(items: string[] | ListItemNode[], ordered = false): ListNode {
    return {
        type: 'list',
        ordered,
        items: items.map(item => typeof item === 'string' ? createSimpleListItem(item) : item)
    }
}

export function createTableCell(text: string, isHeader = false): TableCellNode {
    return {
        type: 'table_cell',
        isHeader,
        children: [createTextNode(text)]
    }
}

export function createTableRow(cells: string[]): TableRowNode {
    return {
        type: 'table_row',
        cells: cells.map(cell => createTableCell(cell))
    }
}

export function createTableNode(headers: string[], rows: string[][]): TableNode {
    return {
        type: 'table',
        headers: headers.map(h => createTableCell(h, true)),
        rows: rows.map(r => createTableRow(r))
    }
}

export function createSlideNode(title: string, children: BlockNode[], layout: SlideNode['layout'] = 'content'): SlideNode {
    return {
        id: generateId(),
        title,
        children,
        layout
    }
}

export function createHeadingNode(text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 2): BlockNode {
    return {
        type: 'heading',
        level,
        children: [createTextNode(text)]
    }
}
