/**
 * Сервис экспорта презентаций в PPTX
 */

import PptxGenJS from 'pptxgenjs'
import type { PresentationAST, BlockNode } from '../types/ast'
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
  renderCanvas,
  renderRoadmap,
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
    // @ts-ignore - Handle ESM/CJS interop
    const PptxGen = PptxGenJS.default || PptxGenJS
    const pptx = new PptxGen()

    // Настройка презентации
    pptx.author = options.author || 'Unknown'
    pptx.company = options.company || ''
    pptx.title = options.title

    // Устанавливаем размер слайдов - используем стандартный 16:9
    pptx.layout = 'LAYOUT_16x9'

    // Определяем мастер-слайд
    pptx.defineSlideMaster({
      title: 'MASTER_SLIDE',
      background: { color: hexToColor(options.theme.backgroundColor) },
    })

    // Получаем размеры слайда
    // Force 16:9 layout dimensions in inches
    const slideWidth = 10
    const slideHeight = 5.625

    const slideStyle = options.slideStyle || DEFAULT_SLIDE_STYLE

    // Генерируем слайды
    for (let slideIndex = 0; slideIndex < ast.slides.length; slideIndex++) {
      const slideNode = ast.slides[slideIndex]
      const pptxSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' })

      // Добавляем фоновое изображение если указано
      if (options.backgroundImage) {
        try {
          const opacity = (options.backgroundOpacity || 100) / 100
          pptxSlide.addImage({
            data: options.backgroundImage,
            x: 0,
            y: 0,
            w: slideWidth,
            h: slideHeight,
            sizing: { type: 'cover', w: slideWidth, h: slideHeight },
            transparency: Math.round((1 - opacity) * 100),
          })
        } catch (error) {
          console.warn('Failed to add background image:', error)
        }
      }

      // Создаём контекст рендеринга
      const context: RenderContext = {
        theme: options.theme,
        slideStyle,
        currentY: slideStyle.padding,
        slideWidth,
        slideHeight,
        contentWidth: slideWidth - (slideStyle.padding || 0.5) * 2,
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

      // Добавляем логотип если указан
      if (options.logo?.enabled && options.logo.url) {
        try {
          const logoSize = options.logo.size
          const margin = 0.2 // отступ от края в дюймах

          let logoX = margin
          let logoY = margin

          switch (options.logo.position) {
            case 'top-left':
              logoX = margin
              logoY = margin
              break
            case 'top-right':
              logoX = slideWidth - logoSize - margin
              logoY = margin
              break
            case 'bottom-left':
              logoX = margin
              logoY = slideHeight - logoSize - margin
              break
            case 'bottom-right':
              logoX = slideWidth - logoSize - margin
              logoY = slideHeight - logoSize - margin
              break
          }

          const opacity = (options.logo.opacity || 100) / 100

          pptxSlide.addImage({
            data: options.logo.url,
            x: logoX,
            y: logoY,
            w: logoSize,
            h: logoSize,
            sizing: { type: 'contain', w: logoSize, h: logoSize },
            transparency: Math.round((1 - opacity) * 100),
          })
        } catch (error) {
          console.warn('Failed to add logo:', error)
        }
      }

      // Добавляем номер слайда, дату и футер
      if (options.includeSlideNumbers !== false) {
        pptxSlide.addText(`${slideIndex + 1} / ${ast.slides.length}`, {
          x: slideWidth - 1,
          y: slideHeight - 0.4,
          w: 0.8,
          h: 0.3,
          fontSize: 10,
          color: hexToColor(options.theme.textColor),
          transparency: 50,
          align: 'right',
        })
      }

      if (options.showDate) {
        pptxSlide.addText(new Date().toLocaleDateString(), {
          x: 0.5,
          y: slideHeight - 0.4,
          w: 2,
          h: 0.3,
          fontSize: 10,
          color: hexToColor(options.theme.textColor),
          transparency: 50,
        })
      }

      if (options.footer) {
        pptxSlide.addText(options.footer, {
          x: 2.5,
          y: slideHeight - 0.4,
          w: slideWidth - 4,
          h: 0.3,
          fontSize: 10,
          color: hexToColor(options.theme.textColor),
          transparency: 50,
          align: 'center',
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
  // @ts-ignore - Handle ESM/CJS interop
  const PptxGen = PptxGenJS.default || PptxGenJS
  const pptx = new PptxGen()

  pptx.author = options.author || 'Unknown'
  pptx.title = options.title

  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: hexToColor(options.theme.backgroundColor) },
  })

  // Force 16:9 layout dimensions in inches
  const slideWidth = 10
  const slideHeight = 5.625

  const slideStyle = options.slideStyle || DEFAULT_SLIDE_STYLE

  for (const slideNode of ast.slides) {
    const pptxSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' })

    // Добавляем фоновое изображение если указано
    if (options.backgroundImage) {
      try {
        const opacity = (options.backgroundOpacity || 100) / 100
        pptxSlide.addImage({
          data: options.backgroundImage,
          x: 0,
          y: 0,
          w: slideWidth,
          h: slideHeight,
          sizing: { type: 'cover', w: slideWidth, h: slideHeight },
          transparency: Math.round((1 - opacity) * 100),
        })
      } catch (error) {
        console.warn('Failed to add background image:', error)
      }
    }

    const context: RenderContext = {
      theme: options.theme,
      slideStyle,
      currentY: slideStyle.padding,
      slideWidth,
      slideHeight,
      contentWidth: slideWidth - (slideStyle.padding || 0.5) * 2,
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

    // Добавляем логотип если указан
    if (options.logo?.enabled && options.logo.url) {
      try {
        const logoSize = options.logo.size
        const margin = 0.2

        let logoX = margin
        let logoY = margin

        switch (options.logo.position) {
          case 'top-left':
            logoX = margin
            logoY = margin
            break
          case 'top-right':
            logoX = slideWidth - logoSize - margin
            logoY = margin
            break
          case 'bottom-left':
            logoX = margin
            logoY = slideHeight - logoSize - margin
            break
          case 'bottom-right':
            logoX = slideWidth - logoSize - margin
            logoY = slideHeight - logoSize - margin
            break
        }

        const opacity = (options.logo.opacity || 100) / 100

        pptxSlide.addImage({
          data: options.logo.url,
          x: logoX,
          y: logoY,
          w: logoSize,
          h: logoSize,
          sizing: { type: 'contain', w: logoSize, h: logoSize },
          transparency: Math.round((1 - opacity) * 100),
        })
      } catch (error) {
        console.warn('Failed to add logo:', error)
      }
    }

    // Добавляем дату если включена
    if (options.showDate) {
      const date = new Date()
      let dateStr = date.toLocaleDateString()

      switch (options.dateFormat) {
        case 'ISO': dateStr = date.toISOString().split('T')[0]; break
        case 'US': dateStr = date.toLocaleDateString('en-US'); break
        case 'EU': dateStr = date.toLocaleDateString('en-GB').replace(/\//g, '.'); break
      }

      const margin = 0.2
      let x = margin
      let y = margin
      const w = 2
      const h = 0.3

      switch (options.datePosition) {
        case 'top-left': x = margin; y = margin; break
        case 'top-right': x = slideWidth - w - margin; y = margin; break
        case 'bottom-left': x = margin; y = slideHeight - h - margin; break
        case 'bottom-right': x = slideWidth - w - margin; y = slideHeight - h - margin; break
        default: x = margin; y = slideHeight - h - margin; break
      }

      pptxSlide.addText(dateStr, {
        x, y, w, h,
        fontSize: 10,
        color: hexToColor(options.theme.textColor),
        transparency: 50,
        align: options.datePosition?.includes('right') ? 'right' : 'left'
      })
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
    case 'canvas':
      return renderCanvas(slide, node, context)
    case 'roadmap':
      return renderRoadmap(slide, node, context)
    default:
      return { height: 0 }
  }
}
