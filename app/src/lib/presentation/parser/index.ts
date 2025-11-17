/**
 * Главный парсер markdown → AST
 */

import { marked } from 'marked'
import type { PresentationAST, SlideNode } from '../types/ast'
import { tokenize, splitIntoSlides } from './tokenizer'
import { buildSlideAST } from './ast-builder'

export interface ParseOptions {
  slideDelimiter?: string
  extractMetadata?: boolean
}

/**
 * Парсит markdown презентацию в AST
 */
export function parseMarkdownToAST(markdown: string, options: ParseOptions = {}): PresentationAST {
  const slideTexts = splitIntoSlides(markdown)
  const slides: SlideNode[] = []

  for (const slideText of slideTexts) {
    const tokens = tokenize(slideText)
    const slideAST = buildSlideAST(tokens)
    slides.push(slideAST)
  }

  return {
    slides,
    metadata: options.extractMetadata ? extractMetadata(markdown) : undefined,
  }
}

/**
 * Парсит один слайд
 */
export function parseSlideMarkdown(markdown: string): SlideNode {
  const tokens = tokenize(markdown)
  return buildSlideAST(tokens)
}

/**
 * Конвертирует markdown в HTML для превью
 */
export function markdownToHtml(markdown: string): string {
  marked.setOptions({
    gfm: true,
    breaks: false,
  })

  return marked.parse(markdown, { async: false }) as string
}

/**
 * Извлекает метаданные из markdown (YAML front matter)
 */
function extractMetadata(markdown: string): Record<string, string> | undefined {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return undefined

  const yamlText = match[1]
  const metadata: Record<string, string> = {}

  for (const line of yamlText.split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()
      metadata[key] = value
    }
  }

  return metadata
}

// Re-export types and utilities
export * from './tokenizer'
export * from './ast-builder'
