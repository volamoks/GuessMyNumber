/**
 * Типы для модуля презентаций
 */

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

export interface PresentationTheme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  codeFontFamily: string
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

export const DEFAULT_THEMES: PresentationTheme[] = [
  {
    id: 'default',
    name: 'Default',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    fontFamily: 'Inter, sans-serif',
    codeFontFamily: 'Fira Code, monospace',
  },
  {
    id: 'dark',
    name: 'Dark',
    primaryColor: '#60a5fa',
    secondaryColor: '#3b82f6',
    backgroundColor: '#0f172a',
    textColor: '#f1f5f9',
    fontFamily: 'Inter, sans-serif',
    codeFontFamily: 'Fira Code, monospace',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    primaryColor: '#0f766e',
    secondaryColor: '#134e4a',
    backgroundColor: '#f8fafc',
    textColor: '#0f172a',
    fontFamily: 'Roboto, sans-serif',
    codeFontFamily: 'Source Code Pro, monospace',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    primaryColor: '#374151',
    secondaryColor: '#111827',
    backgroundColor: '#fafafa',
    textColor: '#171717',
    fontFamily: 'system-ui, sans-serif',
    codeFontFamily: 'ui-monospace, monospace',
  },
]

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
