/**
 * Утилиты для работы с markdown слайдами
 *
 * DEPRECATED: Используйте импорты из @/lib/presentation
 * Этот файл сохранён для обратной совместимости
 */

import type { Slide, SlideContent } from '../types'
import {
  parseMarkdownToAST,
  markdownToHtml as newMarkdownToHtml,
} from '../core'

/**
 * Парсит markdown в массив слайдов (legacy API)
 * @deprecated Используйте parseMarkdownToAST из @/lib/presentation
 */
export function parseMarkdownToSlides(markdown: string): Slide[] {
  try {
    const ast = parseMarkdownToAST(markdown)

    if (!ast.slides || ast.slides.length === 0) {
      // Fallback: создаём слайды напрямую из markdown
      return fallbackParseSlides(markdown)
    }

    // Конвертируем новый AST формат в старый Slide формат
    return ast.slides.map(slideNode => {
      const content: SlideContent[] = []

      for (const node of slideNode.children) {
        switch (node.type) {
          case 'paragraph':
            content.push({
              type: 'text',
              content: extractTextFromASTNode(node),
            })
            break
          case 'list':
            content.push({
              type: 'bullets',
              content: formatListToMarkdown(node),
            })
            break
          case 'code_block':
            content.push({
              type: 'code',
              content: node.value,
              options: { language: node.language },
            })
            break
          case 'table':
            content.push({
              type: 'table',
              content: formatTableToMarkdown(node),
            })
            break
          case 'image':
            content.push({
              type: 'image',
              content: node.url,
              options: { alt: node.alt },
            })
            break
          case 'heading':
            content.push({
              type: 'text',
              content: `${'#'.repeat(node.level)} ${extractTextFromASTNode(node)}`,
            })
            break
        }
      }

      return {
        id: slideNode.id,
        title: slideNode.title || 'Untitled Slide',
        content,
        notes: slideNode.notes,
        layout: slideNode.layout as Slide['layout'],
      }
    })
  } catch (error) {
    console.error('Error parsing markdown:', error)
    return fallbackParseSlides(markdown)
  }
}

/**
 * Fallback парсер - простое разбиение по ---
 */
function fallbackParseSlides(markdown: string): Slide[] {
  const slideTexts = markdown.split(/\n---\n/).map(s => s.trim()).filter(Boolean)

  if (slideTexts.length === 0) {
    return [{
      id: generateId(),
      title: 'Untitled Slide',
      content: [],
      layout: 'title',
    }]
  }

  return slideTexts.map(slideText => {
    const lines = slideText.split('\n')
    let title = 'Untitled Slide'

    for (const line of lines) {
      if (line.startsWith('# ')) {
        title = line.slice(2).trim()
        break
      }
      if (line.startsWith('## ')) {
        title = line.slice(3).trim()
        break
      }
    }

    return {
      id: generateId(),
      title,
      content: [{ type: 'text' as const, content: slideText }],
      layout: 'content' as const,
    }
  })
}

const generateId = () => Math.random().toString(36).substring(2, 15)

/**
 * Конвертирует markdown в HTML для превью
 */
export function markdownToHtml(markdown: string): string {
  return newMarkdownToHtml(markdown)
}

/**
 * Извлекает plain text из bullet list
 */
export function extractBulletPoints(bulletText: string): string[] {
  return bulletText
    .split('\n')
    .map(line => line.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
    .filter(Boolean)
}

// Helper functions для конвертации AST в текст
function extractTextFromASTNode(node: unknown): string {
  if (!node || typeof node !== 'object') return ''

  const n = node as { type?: string; value?: string; children?: unknown[] }

  if (n.type === 'text' && n.value) return n.value
  if (n.type === 'code_inline' && n.value) return n.value

  if (n.children && Array.isArray(n.children)) {
    return n.children.map(extractTextFromASTNode).join('')
  }

  return ''
}

function formatListToMarkdown(node: unknown): string {
  const list = node as { ordered?: boolean; items?: unknown[] }
  if (!list.items) return ''

  return list.items
    .map((item, index) => {
      const listItem = item as { children?: unknown[] }
      const text = listItem.children?.map(extractTextFromASTNode).join(' ').trim() || ''
      const bullet = list.ordered ? `${index + 1}.` : '-'
      return `${bullet} ${text}`
    })
    .join('\n')
}

function formatTableToMarkdown(node: unknown): string {
  const table = node as { headers?: unknown[]; rows?: unknown[] }
  if (!table.headers || !table.rows) return ''

  const headerTexts = table.headers.map(extractTextFromASTNode)
  const rowTexts = table.rows.map(row => {
    const r = row as { cells?: unknown[] }
    return r.cells?.map(extractTextFromASTNode) || []
  })

  const lines: string[] = []
  lines.push(`| ${headerTexts.join(' | ')} |`)
  lines.push(`| ${headerTexts.map(() => '---').join(' | ')} |`)
  for (const row of rowTexts) {
    lines.push(`| ${row.join(' | ')} |`)
  }

  return lines.join('\n')
}
