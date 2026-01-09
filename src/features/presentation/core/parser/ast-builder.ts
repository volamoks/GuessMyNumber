/**
 * AST Builder - конвертирует токены marked в унифицированный AST
 */

import type { Token, Tokens } from 'marked'
import type {
  BlockNode,
  InlineNode,
  HeadingNode,
  ParagraphNode,
  ListNode,
  ListItemNode,
  CodeBlockNode,
  TableNode,
  TableRowNode,
  TableCellNode,
  BlockquoteNode,
  ThematicBreakNode,
  TextNode,
  LinkNode,
  CodeInlineNode,
  ImageNode,
  SlideNode,
  CanvasNode,
  RoadmapNode,
} from '../types/ast'

const generateId = () => Math.random().toString(36).substring(2, 15)

/**
 * Конвертирует inline токен в AST узел
 */
export function buildInlineNode(token: Token): InlineNode {
  switch (token.type) {
    case 'text':
      return buildTextNode(token as Tokens.Text)
    case 'strong':
      return buildStrongNode(token as Tokens.Strong)
    case 'em':
      return buildEmNode(token as Tokens.Em)
    case 'codespan':
      return buildCodespanNode(token as Tokens.Codespan)
    case 'link':
      return buildLinkNode(token as Tokens.Link)
    case 'image':
      return buildImageNode(token as Tokens.Image)
    case 'del':
      return buildDelNode(token as Tokens.Del)
    default:
      // Fallback для неизвестных токенов
      return {
        type: 'text',
        value: 'raw' in token ? String(token.raw) : '',
      }
  }
}

function buildTextNode(token: Tokens.Text): TextNode {
  return {
    type: 'text',
    value: token.text,
  }
}

function buildStrongNode(token: Tokens.Strong): TextNode {
  const text = token.tokens ? token.tokens.map(t => ('text' in t ? t.text : '')).join('') : token.text
  return {
    type: 'text',
    value: text,
    marks: [{ type: 'bold' }],
  }
}

function buildEmNode(token: Tokens.Em): TextNode {
  const text = token.tokens ? token.tokens.map(t => ('text' in t ? t.text : '')).join('') : token.text
  return {
    type: 'text',
    value: text,
    marks: [{ type: 'italic' }],
  }
}

function buildDelNode(token: Tokens.Del): TextNode {
  const text = token.tokens ? token.tokens.map(t => ('text' in t ? t.text : '')).join('') : token.text
  return {
    type: 'text',
    value: text,
    marks: [{ type: 'strikethrough' }],
  }
}

function buildCodespanNode(token: Tokens.Codespan): CodeInlineNode {
  return {
    type: 'code_inline',
    value: token.text,
  }
}

function buildLinkNode(token: Tokens.Link): LinkNode {
  return {
    type: 'link',
    url: token.href,
    title: token.title || undefined,
    children: token.tokens ? token.tokens.map(buildInlineNode) : [{ type: 'text', value: token.text }],
  }
}

function buildImageNode(token: Tokens.Image): ImageNode {
  return {
    type: 'image',
    url: token.href,
    alt: token.text || undefined,
    title: token.title || undefined,
  }
}

/**
 * Конвертирует блочный токен в AST узел
 */
export function buildBlockNode(token: Token): BlockNode | null {
  switch (token.type) {
    case 'heading':
      return buildHeadingNode(token as Tokens.Heading)
    case 'paragraph':
      return buildParagraphNode(token as Tokens.Paragraph)
    case 'list':
      return buildListNode(token as Tokens.List)
    case 'code':
      const codeToken = token as Tokens.Code
      if (codeToken.lang === 'canvas') {
        return buildCanvasNode(codeToken)
      }
      if (codeToken.lang === 'roadmap') {
        return buildRoadmapNode(codeToken)
      }
      return buildCodeBlockNode(codeToken)
    case 'table':
      return buildTableNode(token as Tokens.Table)
    case 'blockquote':
      return buildBlockquoteNode(token as Tokens.Blockquote)
    case 'hr':
      return buildThematicBreakNode()
    case 'html':
      return buildHtmlBlockNode(token as Tokens.HTML)
    case 'space':
      return null // Игнорируем пробелы
    default:
      return null
  }
}

function buildHeadingNode(token: Tokens.Heading): HeadingNode {
  return {
    type: 'heading',
    level: token.depth as 1 | 2 | 3 | 4 | 5 | 6,
    children: token.tokens ? token.tokens.map(buildInlineNode) : [{ type: 'text', value: token.text }],
  }
}

function buildParagraphNode(token: Tokens.Paragraph): ParagraphNode {
  return {
    type: 'paragraph',
    children: token.tokens ? token.tokens.map(buildInlineNode) : [{ type: 'text', value: token.text }],
  }
}

function buildListNode(token: Tokens.List): ListNode {
  return {
    type: 'list',
    ordered: token.ordered,
    start: token.start || undefined,
    items: token.items.map(buildListItemNode),
  }
}

function buildListItemNode(item: Tokens.ListItem): ListItemNode {
  const children: BlockNode[] = []

  if (item.tokens) {
    for (const token of item.tokens) {
      const node = buildBlockNode(token)
      if (node) {
        children.push(node)
      }
    }
  }

  // Если нет блочных элементов, создаём параграф из текста
  if (children.length === 0 && item.text) {
    children.push({
      type: 'paragraph',
      children: [{ type: 'text', value: item.text }],
    })
  }

  return {
    type: 'list_item',
    checked: item.checked !== undefined ? item.checked : undefined,
    children,
  }
}

function buildCodeBlockNode(token: Tokens.Code): CodeBlockNode {
  return {
    type: 'code_block',
    language: token.lang || undefined,
    value: token.text,
  }
}

function buildCanvasNode(token: Tokens.Code): CanvasNode | null {
  try {
    const data = JSON.parse(token.text)
    return {
      type: 'canvas',
      canvasType: data.type || 'business_model_canvas', // Default or extract from JSON
      data: data,
    }
  } catch (e) {
    console.error('Failed to parse canvas JSON', e)
    return null
  }
}

function buildRoadmapNode(token: Tokens.Code): RoadmapNode | null {
  try {
    const data = JSON.parse(token.text)
    return {
      type: 'roadmap',
      data: data,
    }
  } catch (e) {
    console.error('Failed to parse roadmap JSON', e)
    return null
  }
}

function buildTableNode(token: Tokens.Table): TableNode {
  const headers: TableCellNode[] = token.header.map(cell => ({
    type: 'table_cell',
    children: cell.tokens ? cell.tokens.map(buildInlineNode) : [{ type: 'text', value: cell.text }],
    isHeader: true,
  }))

  const rows: TableRowNode[] = token.rows.map(row => ({
    type: 'table_row',
    cells: row.map(cell => ({
      type: 'table_cell',
      children: cell.tokens ? cell.tokens.map(buildInlineNode) : [{ type: 'text', value: cell.text }],
      isHeader: false,
    })),
  }))

  return {
    type: 'table',
    headers,
    rows,
    alignment: token.align || undefined,
  }
}

function buildBlockquoteNode(token: Tokens.Blockquote): BlockquoteNode {
  const children: BlockNode[] = []

  if (token.tokens) {
    for (const t of token.tokens) {
      const node = buildBlockNode(t)
      if (node) {
        children.push(node)
      }
    }
  }

  return {
    type: 'blockquote',
    children,
  }
}

function buildThematicBreakNode(): ThematicBreakNode {
  return {
    type: 'thematic_break',
  }
}

function buildHtmlBlockNode(token: Tokens.HTML): BlockNode {
  return {
    type: 'html_block',
    value: token.text,
  }
}

/**
 * Строит AST слайда из токенов
 */
export function buildSlideAST(tokens: Token[], slideTitle?: string): SlideNode {
  const children: BlockNode[] = []
  let title = slideTitle

  for (const token of tokens) {
    // Если заголовок не установлен, используем первый heading
    if (!title && token.type === 'heading') {
      const heading = token as Tokens.Heading
      if (heading.depth <= 2) {
        title = heading.text
        continue // Не добавляем заголовок в children
      }
    }

    const node = buildBlockNode(token)
    if (node) {
      children.push(node)
    }
  }

  return {
    id: generateId(),
    title: title || 'Untitled Slide',
    children,
    layout: children.length === 0 ? 'title' : 'content',
  }
}
