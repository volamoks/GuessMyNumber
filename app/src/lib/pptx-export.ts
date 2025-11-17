/**
 * Экспорт презентаций в PPTX
 *
 * DEPRECATED: Используйте импорты из @/lib/presentation
 * Этот файл сохранён для обратной совместимости
 */

import type { Slide, PresentationTheme } from './presentation-types'
import { exportMarkdownToPptx, exportASTToBlob } from './presentation'

interface ExportOptions {
  title: string
  author?: string
  theme: PresentationTheme
}

/**
 * Экспортирует markdown презентацию в PPTX файл
 * @deprecated Используйте exportMarkdownToPptx из @/lib/presentation
 */
export async function exportToPptx(
  slides: Slide[],
  options: ExportOptions,
  markdown?: string
): Promise<void> {
  if (!markdown) {
    // Если нет markdown, конвертируем слайды обратно в markdown
    markdown = slidesToMarkdown(slides)
  }

  const result = await exportMarkdownToPptx(markdown, options)

  if (!result.success) {
    throw new Error(result.error || 'Export failed')
  }
}

/**
 * Экспортирует markdown презентацию в Blob
 * @deprecated Используйте exportASTToBlob из @/lib/presentation
 */
export async function exportToPptxBlob(
  slides: Slide[],
  options: ExportOptions,
  markdown?: string
): Promise<Blob> {
  if (!markdown) {
    markdown = slidesToMarkdown(slides)
  }

  const { parseMarkdownToAST } = await import('./presentation')
  const ast = parseMarkdownToAST(markdown)

  return exportASTToBlob(ast, options)
}

/**
 * Конвертирует слайды обратно в markdown
 */
function slidesToMarkdown(slides: Slide[]): string {
  return slides
    .map(slide => {
      const lines: string[] = []

      // Заголовок
      lines.push(`# ${slide.title}`)
      lines.push('')

      // Контент
      for (const content of slide.content) {
        switch (content.type) {
          case 'text':
            lines.push(content.content)
            lines.push('')
            break
          case 'bullets':
            lines.push(content.content)
            lines.push('')
            break
          case 'code':
            lines.push(`\`\`\`${content.options?.language || ''}`)
            lines.push(content.content)
            lines.push('```')
            lines.push('')
            break
          case 'image':
            lines.push(`![${content.options?.alt || 'Image'}](${content.content})`)
            lines.push('')
            break
          case 'table':
            lines.push(content.content)
            lines.push('')
            break
        }
      }

      return lines.join('\n').trim()
    })
    .join('\n\n---\n\n')
}
