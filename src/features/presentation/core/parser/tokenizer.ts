/**
 * Токенизатор markdown - конвертирует текст в токены marked
 */

import { marked, type Token, type Tokens } from 'marked'

export interface TokenizerOptions {
  gfm?: boolean // GitHub Flavored Markdown
  breaks?: boolean // конвертировать \n в <br>
  pedantic?: boolean // строгий режим
}

const defaultOptions: TokenizerOptions = {
  gfm: true,
  breaks: false,
  pedantic: false,
}

/**
 * Разбивает markdown на токены с помощью marked
 */
export function tokenize(markdown: string, options: TokenizerOptions = {}): Token[] {
  const opts = { ...defaultOptions, ...options }

  marked.setOptions({
    gfm: opts.gfm,
    breaks: opts.breaks,
    pedantic: opts.pedantic,
  })

  return marked.lexer(markdown)
}

/**
 * Разбивает markdown на слайды по разделителю ---
 */
export function splitIntoSlides(markdown: string): string[] {
  // Разделяем по --- на отдельной строке
  return markdown
    .split(/\n---\n/)
    .map(s => s.trim())
    .filter(Boolean)
}

/**
 * Извлекает заголовок слайда из токенов
 */
export function extractSlideTitle(tokens: Token[]): { title: string; remainingTokens: Token[] } {
  if (tokens.length === 0) {
    return { title: 'Untitled Slide', remainingTokens: [] }
  }

  const firstToken = tokens[0]

  if (firstToken.type === 'heading' && (firstToken as Tokens.Heading).depth <= 2) {
    return {
      title: (firstToken as Tokens.Heading).text,
      remainingTokens: tokens.slice(1),
    }
  }

  return {
    title: 'Untitled Slide',
    remainingTokens: tokens,
  }
}

/**
 * Проверяет, является ли токен блочным элементом
 */
export function isBlockToken(token: Token): boolean {
  return [
    'heading',
    'paragraph',
    'list',
    'code',
    'table',
    'blockquote',
    'hr',
    'html',
    'space',
    'canvas',
    'roadmap',
  ].includes(token.type)
}

/**
 * Парсит inline токены из текста
 */
export function parseInlineTokens(text: string): Token[] {
  return marked.lexer(text).flatMap(token => {
    if (token.type === 'paragraph' && 'tokens' in token) {
      return token.tokens || []
    }
    return [token]
  })
}
