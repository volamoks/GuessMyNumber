/**
 * Адаптер для конвертации Roadmap данных в презентацию
 */

import type { RoadmapData, RoadmapFeature } from '@/lib/schemas'
import type { PresentationAST } from '../types/ast'
import {
  createSlideNode,
  createParagraphNode,
  createListNode,
  createTableNode,
  createTextNode
} from './ast-utils'

/**
 * Конвертирует Roadmap данные в markdown для презентации
 */
export function roadmapToMarkdown(data: RoadmapData): string {
  const slides: string[] = []

  slides.push(`# ${data.title}\n\n${data.description || 'Product Roadmap'}`)

  slides.push(`## Overview\n\n- **Now**: ${data.now.length} features\n- **Next**: ${data.next.length} features\n- **Later**: ${data.later.length} features\n\nTotal: ${data.now.length + data.next.length + data.later.length} planned items`)

  if (data.now.length > 0) slides.push(`## Now - Current Focus\n\n${formatFeaturesMarkdown(data.now)}`)
  if (data.next.length > 0) slides.push(`## Next - Coming Soon\n\n${formatFeaturesMarkdown(data.next)}`)
  if (data.later.length > 0) slides.push(`## Later - Future Plans\n\n${formatFeaturesMarkdown(data.later)}`)

  slides.push(`## Feature Summary\n\n| Phase | Feature | Priority | Effort | Status |\n|-------|---------|----------|--------|--------|\n${formatFeaturesTable([...data.now, ...data.next, ...data.later])
    }`)

  return slides.join('\n\n---\n\n')
}

/**
 * Конвертирует Roadmap данные напрямую в AST
 */
export function roadmapToAST(data: RoadmapData): PresentationAST {
  const allFeatures = [
    ...data.now.map(f => ({ ...f, phase: 'Now' })),
    ...data.next.map(f => ({ ...f, phase: 'Next' })),
    ...data.later.map(f => ({ ...f, phase: 'Later' })),
  ]

  return {
    slides: [
      createSlideNode(data.title, [createParagraphNode(data.description || 'Product Roadmap')], 'title'),
      createSlideNode('Overview', [
        createListNode([
          `Now: ${data.now.length} features`,
          `Next: ${data.next.length} features`,
          `Later: ${data.later.length} features`,
          `Total: ${allFeatures.length} planned items`,
        ])
      ]),
      ...(data.now.length > 0 ? [createPhaseSlide('Now - Current Focus', data.now)] : []),
      ...(data.next.length > 0 ? [createPhaseSlide('Next - Coming Soon', data.next)] : []),
      ...(data.later.length > 0 ? [createPhaseSlide('Later - Future Plans', data.later)] : []),
      createSlideNode('Feature Summary', [
        createTableNode(
          ['Phase', 'Feature', 'Priority', 'Effort', 'Status'],
          allFeatures.map(f => [f.phase, f.title, f.priority, f.effort, f.status])
        )
      ])
    ],
    metadata: { title: data.title },
  }
}

function formatFeaturesMarkdown(features: RoadmapFeature[]): string {
  return features.map(f =>
    `- ${getPriorityEmoji(f.priority)} **${f.title}** ${getStatusEmoji(f.status)}\n  ${f.description || 'No description'}\n  *Effort: ${f.effort} | Category: ${f.category}*`
  ).join('\n')
}

function formatFeaturesTable(features: RoadmapFeature[]): string {
  return features.map(f => `| ${getPhaseLabel(f)} | ${f.title} | ${f.priority} | ${f.effort} | ${f.status} |`).join('\n')
}

function getPhaseLabel(f: RoadmapFeature): string {
  return (f.status === 'done' || f.status === 'in_progress') ? 'Now' : 'Later'
}

const getPriorityEmoji = (p: string) => ({ high: '🔴', medium: '🟡', low: '🟢' }[p] || '⚪')
const getStatusEmoji = (s: string) => ({ planning: '📋', in_progress: '🚧', done: '✅' }[s] || '📋')

function createPhaseSlide(title: string, features: RoadmapFeature[]) {
  return createSlideNode(title, [
    createListNode(features.map(f => ({
      type: 'list_item' as const,
      children: [
        createParagraphNode([
          createTextNode(f.title, true),
          createTextNode(` (${f.priority} priority, ${f.effort} effort)`)
        ]),
        ...(f.description ? [createParagraphNode(f.description)] : [])
      ]
    })))
  ])
}
