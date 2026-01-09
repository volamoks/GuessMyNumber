/**
 * Адаптер для конвертации Business Canvas данных в презентацию
 */

import type { BusinessCanvasData } from '@/lib/schemas'
import type { PresentationAST, SlideNode, BlockNode, ListNode, TableNode } from '../types/ast'

const generateId = () => Math.random().toString(36).substring(2, 15)

interface CanvasBlock {
  key: keyof BusinessCanvasData
  title: string
  icon: string
}

const CANVAS_BLOCKS: CanvasBlock[] = [
  { key: 'keyPartners', title: 'Key Partners', icon: '🤝' },
  { key: 'keyActivities', title: 'Key Activities', icon: '⚙️' },
  { key: 'keyResources', title: 'Key Resources', icon: '📦' },
  { key: 'valueProposition', title: 'Value Propositions', icon: '💎' },
  { key: 'customerRelationships', title: 'Customer Relationships', icon: '💬' },
  { key: 'channels', title: 'Channels', icon: '📢' },
  { key: 'customerSegments', title: 'Customer Segments', icon: '👥' },
  { key: 'costStructure', title: 'Cost Structure', icon: '💰' },
  { key: 'revenueStreams', title: 'Revenue Streams', icon: '💵' },
]

/**
 * Конвертирует Business Canvas данные в markdown для презентации
 */
export function businessCanvasToMarkdown(data: BusinessCanvasData): string {
  const slides: string[] = []

  // Титульный слайд
  slides.push(`# ${data.title}\n\nBusiness Model Canvas`)

  // Обзорный слайд с таблицей
  slides.push(`## Business Model Overview

| Block | Items |
|-------|-------|
${CANVAS_BLOCKS.map(block => {
    const items = data[block.key] as string[]
    return `| ${block.icon} ${block.title} | ${items.length} |`
  }).join('\n')}`)

  // Слайды для каждого блока
  for (const block of CANVAS_BLOCKS) {
    const items = data[block.key] as string[]
    if (items.length > 0) {
      slides.push(`## ${block.icon} ${block.title}

${items.map(item => `- ${item}`).join('\n')}`)
    }
  }

  // Value Proposition + Customer Segments (ключевая связь)
  const valueProps = data.valueProposition as string[]
  const segments = data.customerSegments as string[]

  if (valueProps.length > 0 && segments.length > 0) {
    slides.push(`## Value-Customer Fit

### Value Propositions
${valueProps.map(item => `- ${item}`).join('\n')}

### Target Customers
${segments.map(item => `- ${item}`).join('\n')}`)
  }

  // Сводка по финансам
  const costs = data.costStructure as string[]
  const revenue = data.revenueStreams as string[]

  if (costs.length > 0 || revenue.length > 0) {
    slides.push(`## Financial Model

### Cost Structure
${costs.length > 0 ? costs.map(item => `- ${item}`).join('\n') : '- No costs defined'}

### Revenue Streams
${revenue.length > 0 ? revenue.map(item => `- ${item}`).join('\n') : '- No revenue streams defined'}`)
  }

  return slides.join('\n\n---\n\n')
}

/**
 * Конвертирует Business Canvas данные напрямую в AST
 */
export function businessCanvasToAST(data: BusinessCanvasData): PresentationAST {
  const slides: SlideNode[] = []

  // Титульный слайд
  slides.push({
    id: generateId(),
    title: data.title,
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: 'Business Model Canvas' }],
      },
    ],
    layout: 'title',
  })

  // Обзорная таблица
  slides.push(createOverviewTableSlide(data))

  // Слайды для каждого блока
  for (const block of CANVAS_BLOCKS) {
    const items = data[block.key] as string[]
    if (items.length > 0) {
      slides.push(createBlockSlide(block.title, block.icon, items))
    }
  }

  // Value-Customer Fit слайд
  const valueProps = data.valueProposition as string[]
  const segments = data.customerSegments as string[]

  if (valueProps.length > 0 && segments.length > 0) {
    slides.push(createValueCustomerFitSlide(valueProps, segments))
  }

  // Финансовый слайд
  const costs = data.costStructure as string[]
  const revenue = data.revenueStreams as string[]

  if (costs.length > 0 || revenue.length > 0) {
    slides.push(createFinancialSlide(costs, revenue))
  }

  return {
    slides,
    metadata: {
      title: data.title,
    },
  }
}

function createOverviewTableSlide(data: BusinessCanvasData): SlideNode {
  const table: TableNode = {
    type: 'table',
    headers: [
      { type: 'table_cell', children: [{ type: 'text', value: 'Block' }], isHeader: true },
      { type: 'table_cell', children: [{ type: 'text', value: 'Items' }], isHeader: true },
    ],
    rows: CANVAS_BLOCKS.map(block => {
      const items = data[block.key] as string[]
      return {
        type: 'table_row',
        cells: [
          {
            type: 'table_cell',
            children: [{ type: 'text', value: `${block.icon} ${block.title}` }],
          },
          {
            type: 'table_cell',
            children: [{ type: 'text', value: String(items.length) }],
          },
        ],
      }
    }),
  }

  return {
    id: generateId(),
    title: 'Business Model Overview',
    children: [table],
    layout: 'content',
  }
}

function createBlockSlide(title: string, icon: string, items: string[]): SlideNode {
  const list: ListNode = {
    type: 'list',
    ordered: false,
    items: items.map(item => ({
      type: 'list_item',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: item }],
        },
      ],
    })),
  }

  return {
    id: generateId(),
    title: `${icon} ${title}`,
    children: [list],
    layout: 'content',
  }
}

function createValueCustomerFitSlide(valueProps: string[], segments: string[]): SlideNode {
  const children: BlockNode[] = []

  // Value Propositions
  children.push({
    type: 'heading',
    level: 3,
    children: [{ type: 'text', value: 'Value Propositions' }],
  })

  children.push({
    type: 'list',
    ordered: false,
    items: valueProps.map(item => ({
      type: 'list_item',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: item }],
        },
      ],
    })),
  })

  // Customer Segments
  children.push({
    type: 'heading',
    level: 3,
    children: [{ type: 'text', value: 'Target Customers' }],
  })

  children.push({
    type: 'list',
    ordered: false,
    items: segments.map(item => ({
      type: 'list_item',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', value: item }],
        },
      ],
    })),
  })

  return {
    id: generateId(),
    title: 'Value-Customer Fit',
    children,
    layout: 'content',
  }
}

function createFinancialSlide(costs: string[], revenue: string[]): SlideNode {
  const children: BlockNode[] = []

  // Cost Structure
  children.push({
    type: 'heading',
    level: 3,
    children: [{ type: 'text', value: 'Cost Structure' }],
  })

  children.push({
    type: 'list',
    ordered: false,
    items:
      costs.length > 0
        ? costs.map(item => ({
            type: 'list_item' as const,
            children: [
              {
                type: 'paragraph' as const,
                children: [{ type: 'text' as const, value: item }],
              },
            ],
          }))
        : [
            {
              type: 'list_item' as const,
              children: [
                {
                  type: 'paragraph' as const,
                  children: [{ type: 'text' as const, value: 'No costs defined' }],
                },
              ],
            },
          ],
  })

  // Revenue Streams
  children.push({
    type: 'heading',
    level: 3,
    children: [{ type: 'text', value: 'Revenue Streams' }],
  })

  children.push({
    type: 'list',
    ordered: false,
    items:
      revenue.length > 0
        ? revenue.map(item => ({
            type: 'list_item' as const,
            children: [
              {
                type: 'paragraph' as const,
                children: [{ type: 'text' as const, value: item }],
              },
            ],
          }))
        : [
            {
              type: 'list_item' as const,
              children: [
                {
                  type: 'paragraph' as const,
                  children: [{ type: 'text' as const, value: 'No revenue streams defined' }],
                },
              ],
            },
          ],
  })

  return {
    id: generateId(),
    title: 'Financial Model',
    children,
    layout: 'content',
  }
}
