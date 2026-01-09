/**
 * Публичный API модуля презентаций
 *
 * Унифицированная система для:
 * - Парсинга markdown в AST
 * - Экспорта AST в PPTX с поддержкой всех элементов
 * - Конвертации данных из других модулей (roadmap, canvas)
 */

// Types
export * from './types'

// Parser
export { parseMarkdownToAST, parseSlideMarkdown, markdownToHtml } from './parser'

// Export
export { exportMarkdownToPptx, exportASTToPptx, exportASTToBlob } from './export'

// Adapters
export {
  roadmapToMarkdown,
  roadmapToAST,
  businessCanvasToMarkdown,
  businessCanvasToAST,
} from './adapters'
