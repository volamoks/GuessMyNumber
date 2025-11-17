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
    codeFontFamily: 'JetBrains Mono, monospace',
  },
  {
    id: 'dark',
    name: 'Dark',
    primaryColor: '#60a5fa',
    secondaryColor: '#3b82f6',
    backgroundColor: '#1e293b',
    textColor: '#e2e8f0',
    fontFamily: 'Inter, sans-serif',
    codeFontFamily: 'JetBrains Mono, monospace',
  },
  {
    id: 'corporate',
    name: 'Corporate',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    backgroundColor: '#f8fafc',
    textColor: '#1e293b',
    fontFamily: 'Inter, sans-serif',
    codeFontFamily: 'JetBrains Mono, monospace',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    primaryColor: '#6366f1',
    secondaryColor: '#4f46e5',
    backgroundColor: '#fafafa',
    textColor: '#18181b',
    fontFamily: 'Inter, sans-serif',
    codeFontFamily: 'JetBrains Mono, monospace',
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
