/**
 * Сервис экспорта презентаций в PPTX
 */

import type { PresentationAST } from '../types/ast'
import type { ExportOptions, ExportResult } from '../types/export'
import { parseMarkdownToAST } from '../parser'
import { PptxExporter } from './exporter'

/**
 * Экспортирует markdown презентацию в PPTX файл
 */
export async function exportMarkdownToPptx(
  markdown: string,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const ast = parseMarkdownToAST(markdown)
    return await exportASTToPptx(ast, options)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during export',
    }
  }
}

/**
 * Экспортирует AST презентации в PPTX файл
 */
export async function exportASTToPptx(
  ast: PresentationAST,
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const exporter = new PptxExporter(options)
    await exporter.exportAST(ast)
    const fileName = await exporter.saveToFile()

    return {
      success: true,
      fileName,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during export',
    }
  }
}

/**
 * Экспортирует AST в Blob для предпросмотра
 */
export async function exportASTToBlob(
  ast: PresentationAST,
  options: ExportOptions
): Promise<Blob> {
  const exporter = new PptxExporter(options)
  await exporter.exportAST(ast)
  return await exporter.writeToBlob()
}
