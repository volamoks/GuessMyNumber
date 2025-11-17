/**
 * Типы для тем и стилизации презентаций
 */

export interface PresentationTheme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  codeFontFamily: string

  // Дополнительные настройки
  headingColor?: string
  linkColor?: string
  codeBackgroundColor?: string
  borderColor?: string
  accentColor?: string
}

export interface SlideStyle {
  padding: number // в дюймах
  titleFontSize: number
  bodyFontSize: number
  codeFontSize: number
  lineSpacing: number
  bulletIndent: number
}

export const DEFAULT_SLIDE_STYLE: SlideStyle = {
  padding: 0.5,
  titleFontSize: 36,
  bodyFontSize: 18,
  codeFontSize: 14,
  lineSpacing: 1.5,
  bulletIndent: 0.5,
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
