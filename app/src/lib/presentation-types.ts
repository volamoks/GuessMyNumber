/**
 * Типы для модуля презентаций
 *
 * DEPRECATED: Используйте импорты из @/lib/presentation
 * Этот файл сохранён для обратной совместимости
 */

// Re-export типов из нового модульного API
export { DEFAULT_THEMES } from './presentation/types/theme'
export type { PresentationTheme } from './presentation/types/theme'
export type { SlideNode } from './presentation/types/ast'

// Import for local use
import type { PresentationTheme } from './presentation/types/theme'

// Старые типы для обратной совместимости
export interface SlideContent {
  type: 'title' | 'text' | 'bullets' | 'code' | 'image' | 'table'
  content: string
  options?: {
    language?: string // для code blocks
    level?: number // для bullet lists
    alt?: string // для images
  }
}

export interface Slide {
  id: string
  title: string
  content: SlideContent[]
  notes?: string // speaker notes
  layout?: 'title' | 'content' | 'two-column' | 'image-full'
}

export interface Presentation {
  id: string
  title: string
  author?: string
  createdAt: Date
  updatedAt: Date
  slides: Slide[]
  theme: PresentationTheme
  markdown: string // исходный markdown
}

export const SAMPLE_MARKDOWN = `# My Presentation

---

## Introduction

Welcome to this presentation!

- Point one
- Point two
- Point three

---

## Code Example

Here's some code:

\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`

---

## Key Features

1. Easy markdown editing
2. Live preview
3. Export to PPTX
4. Multiple themes

---

## Thank You!

Questions?
`
