/**
 * Адаптер для конвертации Business Canvas данных в презентацию
 */

import type { BusinessCanvasData } from '@/lib/schemas'
import type { PresentationAST } from '../types/ast'
import {
  createSlideNode,
  createParagraphNode,
  createListNode,
  createTableNode,
  createHeadingNode
} from './ast-utils'

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

  slides.push(`# ${data.title}\n\nBusiness Model Canvas`)

  slides.push(`## Business Model Overview\n\n| Block | Items |\n|-------|-------|\n${CANVAS_BLOCKS.map(block => `| ${block.icon} ${block.title} | ${(data[block.key] as string[]).length} |`).join('\n')
    }`)

  for (const block of CANVAS_BLOCKS) {
    const items = data[block.key] as string[]
    if (items.length > 0) {
      slides.push(`## ${block.icon} ${block.title}\n\n${items.map(item => `- ${item}`).join('\n')}`)
    }
  }

  const valueProps = data.valueProposition as string[]
  const segments = data.customerSegments as string[]

  if (valueProps.length > 0 && segments.length > 0) {
    slides.push(`## Value-Customer Fit\n\n### Value Propositions\n${valueProps.map(item => `- ${item}`).join('\n')
      }\n\n### Target Customers\n${segments.map(item => `- ${item}`).join('\n')
      }`)
  }

  const costs = data.costStructure as string[]
  const revenue = data.revenueStreams as string[]

  if (costs.length > 0 || revenue.length > 0) {
    slides.push(`## Financial Model\n\n### Cost Structure\n${costs.length > 0 ? costs.map(item => `- ${item}`).join('\n') : '- No costs defined'
      }\n\n### Revenue Streams\n${revenue.length > 0 ? revenue.map(item => `- ${item}`).join('\n') : '- No revenue streams defined'
      }`)
  }

  return slides.join('\n\n---\n\n')
}

/**
 * Конвертирует Business Canvas данные напрямую в AST
 */
export function businessCanvasToAST(data: BusinessCanvasData): PresentationAST {
  return {
    slides: [
      createSlideNode(data.title, [createParagraphNode('Business Model Canvas')], 'title'),
      createOverviewSlide(data),
      ...CANVAS_BLOCKS
        .filter(b => (data[b.key] as string[]).length > 0)
        .map(b => createSlideNode(`${b.icon} ${b.title}`, [createListNode(data[b.key] as string[])])),
      ...createSpecialSlides(data)
    ],
    metadata: { title: data.title },
  }
}

function createOverviewSlide(data: BusinessCanvasData) {
  return createSlideNode('Business Model Overview', [
    createTableNode(
      ['Block', 'Items'],
      CANVAS_BLOCKS.map(b => [`${b.icon} ${b.title}`, String((data[b.key] as string[]).length)])
    )
  ])
}

function createSpecialSlides(data: BusinessCanvasData) {
  const slides = []
  const vps = data.valueProposition as string[]
  const css = data.customerSegments as string[]

  if (vps.length > 0 && css.length > 0) {
    slides.push(createSlideNode('Value-Customer Fit', [
      createHeadingNode('Value Propositions', 3),
      createListNode(vps),
      createHeadingNode('Target Customers', 3),
      createListNode(css)
    ]))
  }

  const costs = data.costStructure as string[]
  const revenue = data.revenueStreams as string[]

  if (costs.length > 0 || revenue.length > 0) {
    slides.push(createSlideNode('Financial Model', [
      createHeadingNode('Cost Structure', 3),
      createListNode(costs.length > 0 ? costs : ['No costs defined']),
      createHeadingNode('Revenue Streams', 3),
      createListNode(revenue.length > 0 ? revenue : ['No revenue streams defined'])
    ]))
  }

  return slides
}
