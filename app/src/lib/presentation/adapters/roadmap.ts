/**
 * Адаптер для конвертации Roadmap данных в презентацию
 */

import type { RoadmapData, RoadmapFeature } from '@/lib/schemas'
import type { PresentationAST, SlideNode, BlockNode, ListNode, ListItemNode, TableNode } from '../types/ast'

const generateId = () => Math.random().toString(36).substring(2, 15)

/**
 * Конвертирует Roadmap данные в markdown для презентации
 */
export function roadmapToMarkdown(data: RoadmapData): string {
  const slides: string[] = []

  // Титульный слайд
  slides.push(`# ${data.title}\n\n${data.description || 'Product Roadmap'}`)

  // Обзорный слайд
  slides.push(`## Overview

- **Now**: ${data.now.length} features
- **Next**: ${data.next.length} features
- **Later**: ${data.later.length} features

Total: ${data.now.length + data.next.length + data.later.length} planned items`)

  // Now слайд
  if (data.now.length > 0) {
    slides.push(`## Now - Current Focus

${formatFeaturesList(data.now)}`)
  }

  // Next слайд
  if (data.next.length > 0) {
    slides.push(`## Next - Coming Soon

${formatFeaturesList(data.next)}`)
  }

  // Later слайд
  if (data.later.length > 0) {
    slides.push(`## Later - Future Plans

${formatFeaturesList(data.later)}`)
  }

  // Сводная таблица
  slides.push(`## Feature Summary

| Phase | Feature | Priority | Effort | Status |
|-------|---------|----------|--------|--------|
${formatFeaturesTable([...data.now, ...data.next, ...data.later])}`)

  return slides.join('\n\n---\n\n')
}

/**
 * Конвертирует Roadmap данные напрямую в AST
 */
export function roadmapToAST(data: RoadmapData): PresentationAST {
  const slides: SlideNode[] = []

  // Титульный слайд
  slides.push({
    id: generateId(),
    title: data.title,
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: data.description || 'Product Roadmap' }],
      },
    ],
    layout: 'title',
  })

  // Обзорный слайд
  slides.push({
    id: generateId(),
    title: 'Overview',
    children: [createOverviewList(data)],
    layout: 'content',
  })

  // Слайды для каждой фазы
  if (data.now.length > 0) {
    slides.push(createPhaseSlide('Now - Current Focus', data.now))
  }

  if (data.next.length > 0) {
    slides.push(createPhaseSlide('Next - Coming Soon', data.next))
  }

  if (data.later.length > 0) {
    slides.push(createPhaseSlide('Later - Future Plans', data.later))
  }

  // Сводная таблица
  slides.push(createSummaryTableSlide([
    ...data.now.map(f => ({ ...f, phase: 'Now' })),
    ...data.next.map(f => ({ ...f, phase: 'Next' })),
    ...data.later.map(f => ({ ...f, phase: 'Later' })),
  ]))

  return {
    slides,
    metadata: {
      title: data.title,
    },
  }
}

function formatFeaturesList(features: RoadmapFeature[]): string {
  return features
    .map(f => {
      const priority = getPriorityEmoji(f.priority)
      const status = getStatusEmoji(f.status)
      return `- ${priority} **${f.title}** ${status}\n  ${f.description || 'No description'}\n  *Effort: ${f.effort} | Category: ${f.category}*`
    })
    .join('\n')
}

function formatFeaturesTable(features: RoadmapFeature[]): string {
  return features
    .map(f => `| ${getPhase(f)} | ${f.title} | ${f.priority} | ${f.effort} | ${f.status} |`)
    .join('\n')
}

function getPhase(feature: RoadmapFeature): string {
  // Определяем фазу на основе статуса
  if (feature.status === 'done') return 'Now'
  if (feature.status === 'in_progress') return 'Now'
  return 'Later'
}

function getPriorityEmoji(priority: string): string {
  const map: Record<string, string> = {
    high: '🔴',
    medium: '🟡',
    low: '🟢',
  }
  return map[priority] || '⚪'
}

function getStatusEmoji(status: string): string {
  const map: Record<string, string> = {
    planning: '📋',
    in_progress: '🚧',
    done: '✅',
  }
  return map[status] || '📋'
}

function createOverviewList(data: RoadmapData): ListNode {
  return {
    type: 'list',
    ordered: false,
    items: [
      createListItem(`Now: ${data.now.length} features`),
      createListItem(`Next: ${data.next.length} features`),
      createListItem(`Later: ${data.later.length} features`),
      createListItem(`Total: ${data.now.length + data.next.length + data.later.length} planned items`),
    ],
  }
}

function createListItem(text: string): ListItemNode {
  return {
    type: 'list_item',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', value: text }],
      },
    ],
  }
}

function createPhaseSlide(title: string, features: RoadmapFeature[]): SlideNode {
  const children: BlockNode[] = []

  const list: ListNode = {
    type: 'list',
    ordered: false,
    items: features.map(f => ({
      type: 'list_item',
      children: [
        {
          type: 'paragraph',
          children: [
            { type: 'text', value: f.title, marks: [{ type: 'bold' }] },
            { type: 'text', value: ` (${f.priority} priority, ${f.effort} effort)` },
          ],
        },
        ...(f.description
          ? [
              {
                type: 'paragraph' as const,
                children: [{ type: 'text' as const, value: f.description }],
              },
            ]
          : []),
      ],
    })),
  }

  children.push(list)

  return {
    id: generateId(),
    title,
    children,
    layout: 'content',
  }
}

function createSummaryTableSlide(features: (RoadmapFeature & { phase: string })[]): SlideNode {
  const table: TableNode = {
    type: 'table',
    headers: [
      { type: 'table_cell', children: [{ type: 'text', value: 'Phase' }], isHeader: true },
      { type: 'table_cell', children: [{ type: 'text', value: 'Feature' }], isHeader: true },
      { type: 'table_cell', children: [{ type: 'text', value: 'Priority' }], isHeader: true },
      { type: 'table_cell', children: [{ type: 'text', value: 'Effort' }], isHeader: true },
      { type: 'table_cell', children: [{ type: 'text', value: 'Status' }], isHeader: true },
    ],
    rows: features.map(f => ({
      type: 'table_row',
      cells: [
        { type: 'table_cell', children: [{ type: 'text', value: f.phase }] },
        { type: 'table_cell', children: [{ type: 'text', value: f.title }] },
        { type: 'table_cell', children: [{ type: 'text', value: f.priority }] },
        { type: 'table_cell', children: [{ type: 'text', value: f.effort }] },
        { type: 'table_cell', children: [{ type: 'text', value: f.status }] },
      ],
    })),
  }

  return {
    id: generateId(),
    title: 'Feature Summary',
    children: [table],
    layout: 'content',
  }
}
