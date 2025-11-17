import { useMemo } from 'react'
import { marked } from 'marked'
import { cn } from '@/lib/utils'

interface MarkdownPreviewProps {
  content: string
  className?: string
  fullWidth?: boolean
  compact?: boolean
}

/**
 * Компонент для рендеринга Markdown в HTML с автоматическими стилями.
 *
 * Использует класс "prose" для автоматической стилизации:
 * - Заголовки (h1-h6) с правильными размерами и отступами
 * - Таблицы с бордерами и zebra striping
 * - Списки (маркированные, нумерованные, вложенные)
 * - Блоки кода с подсветкой
 * - Цитаты с левой полосой
 * - Ссылки с hover эффектом
 * - И многое другое
 */
export function MarkdownPreview({
  content,
  className,
  fullWidth = false,
  compact = false
}: MarkdownPreviewProps) {
  const html = useMemo(() => {
    if (!content) return ''

    // Configure marked for GFM (GitHub Flavored Markdown)
    marked.setOptions({
      gfm: true,
      breaks: true,
    })

    return marked.parse(content, { async: false }) as string
  }, [content])

  if (!content) {
    return (
      <div className={cn('text-muted-foreground italic', className)}>
        No content to preview
      </div>
    )
  }

  return (
    <div
      className={cn(
        'prose',
        fullWidth && 'prose-full',
        compact && 'prose-compact',
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
