/**
 * AST (Abstract Syntax Tree) типы для markdown элементов
 * Унифицированное представление всех элементов контента
 */

// Базовый тип для всех AST узлов
export interface ASTNode {
  type: string
  position?: {
    start: number
    end: number
  }
}

// Текстовые элементы (inline)
export interface TextNode extends ASTNode {
  type: 'text'
  value: string
  marks?: TextMark[]
}

export interface TextMark {
  type: 'bold' | 'italic' | 'code' | 'strikethrough' | 'underline'
}

export interface LinkNode extends ASTNode {
  type: 'link'
  url: string
  title?: string
  children: InlineNode[]
}

export interface ImageNode extends ASTNode {
  type: 'image'
  url: string
  alt?: string
  title?: string
  width?: number
  height?: number
}

export interface CodeInlineNode extends ASTNode {
  type: 'code_inline'
  value: string
}

// Inline nodes - можно вкладывать в текст
export type InlineNode = TextNode | LinkNode | CodeInlineNode | ImageNode

// Заголовки
export interface HeadingNode extends ASTNode {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  children: InlineNode[]
}

// Параграф
export interface ParagraphNode extends ASTNode {
  type: 'paragraph'
  children: InlineNode[]
}

// Списки
export interface ListNode extends ASTNode {
  type: 'list'
  ordered: boolean
  start?: number // для нумерованных списков
  items: ListItemNode[]
}

export interface ListItemNode extends ASTNode {
  type: 'list_item'
  checked?: boolean // для task lists
  children: BlockNode[]
}

// Код блок
export interface CodeBlockNode extends ASTNode {
  type: 'code_block'
  language?: string
  value: string
  meta?: string // дополнительные параметры после языка
}

// Таблица
export interface TableNode extends ASTNode {
  type: 'table'
  headers: TableCellNode[]
  rows: TableRowNode[]
  alignment?: ('left' | 'center' | 'right' | null)[]
}

export interface TableRowNode extends ASTNode {
  type: 'table_row'
  cells: TableCellNode[]
}

export interface TableCellNode extends ASTNode {
  type: 'table_cell'
  children: InlineNode[]
  isHeader?: boolean
}

// Цитата
export interface BlockquoteNode extends ASTNode {
  type: 'blockquote'
  children: BlockNode[]
}

// Горизонтальная линия
export interface ThematicBreakNode extends ASTNode {
  type: 'thematic_break'
}

// HTML блок (для специальных элементов)
export interface HTMLBlockNode extends ASTNode {
  type: 'html_block'
  value: string
}

// Все блочные элементы
export type BlockNode =
  | HeadingNode
  | ParagraphNode
  | ListNode
  | CodeBlockNode
  | TableNode
  | BlockquoteNode
  | ThematicBreakNode
  | HTMLBlockNode
  | HTMLBlockNode
  | ImageNode
  | CanvasNode
  | RoadmapNode

// Слайд
export interface SlideNode {
  id: string
  title?: string
  children: BlockNode[]
  notes?: string
  layout?: SlideLayout
}

export type SlideLayout = 'title' | 'content' | 'two-column' | 'image-full' | 'blank'

// Презентация
export interface PresentationAST {
  slides: SlideNode[]
  metadata?: PresentationMetadata
}

export interface PresentationMetadata {
  title?: string
  author?: string
  date?: string
  version?: string
}

export interface CanvasNode extends ASTNode {
  type: 'canvas'
  canvasType: 'business_model_canvas' | 'lean_canvas' | 'cjm'
  data: any // Typed data from schemas
}

export interface RoadmapNode extends ASTNode {
  type: 'roadmap'
  data: any // Typed data from schemas
}

// Утилиты для работы с AST
export function isBlockNode(node: ASTNode): node is BlockNode {
  return [
    'heading',
    'paragraph',
    'list',
    'code_block',
    'table',
    'blockquote',
    'thematic_break',
    'html_block',
    'image',
  ].includes(node.type)
}

export function isInlineNode(node: ASTNode): node is InlineNode {
  return ['text', 'link', 'code_inline', 'image'].includes(node.type)
}

export function extractTextFromInline(nodes: InlineNode[]): string {
  return nodes
    .map(node => {
      if (node.type === 'text') return node.value
      if (node.type === 'link') return extractTextFromInline(node.children)
      if (node.type === 'code_inline') return node.value
      if (node.type === 'image') return node.alt || ''
      return ''
    })
    .join('')
}
