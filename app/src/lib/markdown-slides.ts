import { marked } from 'marked'
import type { Slide, SlideContent } from './presentation-types'

const generateId = () => Math.random().toString(36).substring(2, 15)

/**
 * Парсит markdown в массив слайдов
 * Разделитель слайдов: --- (три дефиса на отдельной строке)
 */
export function parseMarkdownToSlides(markdown: string): Slide[] {
  // Разбиваем по разделителю слайдов
  const slideTexts = markdown.split(/\n---\n/).map(s => s.trim()).filter(Boolean)

  const slides: Slide[] = slideTexts.map((slideText) => {
    const lines = slideText.split('\n')
    let title = ''
    const content: SlideContent[] = []
    let currentContent: string[] = []
    let currentType: SlideContent['type'] = 'text'
    let codeLanguage = ''
    let inCodeBlock = false

    const flushContent = () => {
      if (currentContent.length > 0) {
        const text = currentContent.join('\n').trim()
        if (text) {
          if (currentType === 'code') {
            content.push({
              type: 'code',
              content: text,
              options: { language: codeLanguage },
            })
          } else if (currentType === 'bullets') {
            content.push({
              type: 'bullets',
              content: text,
            })
          } else {
            content.push({
              type: 'text',
              content: text,
            })
          }
        }
        currentContent = []
        currentType = 'text'
        codeLanguage = ''
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Code block start
      if (line.startsWith('```') && !inCodeBlock) {
        flushContent()
        inCodeBlock = true
        codeLanguage = line.slice(3).trim() || 'text'
        currentType = 'code'
        continue
      }

      // Code block end
      if (line.startsWith('```') && inCodeBlock) {
        flushContent()
        inCodeBlock = false
        continue
      }

      // Inside code block
      if (inCodeBlock) {
        currentContent.push(line)
        continue
      }

      // Title (# или ##)
      if (line.startsWith('# ') && !title) {
        flushContent()
        title = line.slice(2).trim()
        continue
      }

      if (line.startsWith('## ') && !title) {
        flushContent()
        title = line.slice(3).trim()
        continue
      }

      // Bullet list
      if (line.match(/^[-*]\s+/) || line.match(/^\d+\.\s+/)) {
        if (currentType !== 'bullets') {
          flushContent()
          currentType = 'bullets'
        }
        currentContent.push(line)
        continue
      }

      // Image
      const imageMatch = line.match(/!\[(.*?)\]\((.*?)\)/)
      if (imageMatch) {
        flushContent()
        content.push({
          type: 'image',
          content: imageMatch[2],
          options: { alt: imageMatch[1] },
        })
        continue
      }

      // Regular text
      if (currentType === 'bullets' && line.trim()) {
        flushContent()
      }

      if (line.trim()) {
        currentContent.push(line)
      } else if (currentContent.length > 0) {
        flushContent()
      }
    }

    flushContent()

    return {
      id: generateId(),
      title: title || 'Untitled Slide',
      content,
      layout: content.length === 0 ? 'title' : 'content',
    }
  })

  return slides
}

/**
 * Конвертирует markdown в HTML для превью
 */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string
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
