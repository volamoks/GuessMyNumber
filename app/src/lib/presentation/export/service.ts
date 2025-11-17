/**
 * Сервис экспорта презентаций в PPTX
 */

import PptxGenJS from 'pptxgenjs'
import type { PresentationAST, SlideNode, BlockNode } from '../types/ast'
import type { ExportOptions, RenderContext, ExportResult } from '../types/export'
import { DEFAULT_SLIDE_STYLE } from '../types/theme'
import { parseMarkdownToAST } from '../parser'

import {
  renderHeading,
  renderParagraph,
  renderList,
  renderTable,
  renderCodeBlock,
  renderImage,
  renderBlockquote,
  hexToColor,
} from './renderers'

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
    const pptx = new PptxGenJS()

    // Настройка презентации
    pptx.author = options.author || 'Unknown'
    pptx.company = options.company || ''
    pptx.title = options.title

    // Устанавливаем размер слайдов
    if (options.slideSize) {
      pptx.layout = options.slideSize
    }

    // Определяем мастер-слайд
    pptx.defineSlideMaster({
      title: 'MASTER_SLIDE',
      background: { color: hexToColor(options.theme.backgroundColor) },
    })

    // Получаем размеры слайда
    const slideWidth = pptx.presLayout.width || 10
    const slideHeight = pptx.presLayout.height || 5.625

    const slideStyle = options.slideStyle || DEFAULT_SLIDE_STYLE

    // Генерируем слайды
    for (let slideIndex = 0; slideIndex < ast.slides.length; slideIndex++) {
      const slideNode = ast.slides[slideIndex]
      const pptxSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' })

      // Создаём контекст рендеринга
      const context: RenderContext = {
        theme: options.theme,
        slideStyle,
        currentY: slideStyle.padding,
        slideWidth,
        slideHeight,
        contentWidth: slideWidth - slideStyle.padding * 2,
      }

      // Рендерим заголовок слайда
      if (slideNode.title) {
        pptxSlide.addText(slideNode.title, {
          x: slideStyle.padding,
          y: slideStyle.padding,
          w: context.contentWidth,
          h: 0.8,
          fontSize: slideStyle.titleFontSize,
          bold: true,
          color: hexToColor(options.theme.primaryColor),
          fontFace: options.theme.fontFamily.split(',')[0].trim(),
        })
        context.currentY = slideStyle.padding + 1.0
      }

      // Рендерим содержимое слайда
      for (const node of slideNode.children) {
        const result = renderBlockNode(pptxSlide, node, context)
        context.currentY += result.height
      }

      // Добавляем номер слайда
      if (options.includeSlideNumbers !== false) {
        pptxSlide.addText(`${slideIndex + 1} / ${ast.slides.length}`, {
          x: slideWidth - 1,
          y: slideHeight - 0.4,
          w: 0.8,
          h: 0.3,
          fontSize: 10,
          color: hexToColor(options.theme.textColor) + '80',
          align: 'right',
        })
      }

      // Добавляем speaker notes
      if (slideNode.notes) {
        pptxSlide.addNotes(slideNode.notes)
      }
    }

    // Скачиваем файл
    const fileName = `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`
    await pptx.writeFile({ fileName })

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
  const pptx = new PptxGenJS()

  pptx.author = options.author || 'Unknown'
  pptx.title = options.title

  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: hexToColor(options.theme.backgroundColor) },
  })

  const slideWidth = pptx.presLayout.width || 10
  const slideHeight = pptx.presLayout.height || 5.625
  const slideStyle = options.slideStyle || DEFAULT_SLIDE_STYLE

  for (const slideNode of ast.slides) {
    const pptxSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' })

    const context: RenderContext = {
      theme: options.theme,
      slideStyle,
      currentY: slideStyle.padding,
      slideWidth,
      slideHeight,
      contentWidth: slideWidth - slideStyle.padding * 2,
    }

    if (slideNode.title) {
      pptxSlide.addText(slideNode.title, {
        x: slideStyle.padding,
        y: slideStyle.padding,
        w: context.contentWidth,
        h: 0.8,
        fontSize: slideStyle.titleFontSize,
        bold: true,
        color: hexToColor(options.theme.primaryColor),
      })
      context.currentY = slideStyle.padding + 1.0
    }

    for (const node of slideNode.children) {
      const result = renderBlockNode(pptxSlide, node, context)
      context.currentY += result.height
    }
  }

  return (await pptx.write({ outputType: 'blob' })) as Blob
}

/**
 * Рендерит блочный узел AST
 */
function renderBlockNode(
  slide: PptxGenJS.Slide,
  node: BlockNode,
  context: RenderContext
): { height: number } {
  switch (node.type) {
    case 'heading':
      return renderHeading(slide, node, context)
    case 'paragraph':
      return renderParagraph(slide, node, context)
    case 'list':
      return renderList(slide, node, context)
    case 'code_block':
      return renderCodeBlock(slide, node, context)
    case 'table':
      return renderTable(slide, node, context)
    case 'blockquote':
      return renderBlockquote(slide, node, context)
    case 'image':
      return renderImage(slide, node, context)
    case 'thematic_break':
      // Для горизонтальной линии просто добавляем отступ
      return { height: 0.3 }
    case 'html_block':
      // HTML блоки пропускаем
      return { height: 0 }
    default:
      return { height: 0 }
  }
}
