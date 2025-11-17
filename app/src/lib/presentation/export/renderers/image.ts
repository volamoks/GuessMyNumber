/**
 * Рендерер для изображений
 */

import type PptxGenJS from 'pptxgenjs'
import type { ImageNode } from '../../types/ast'
import type { RenderContext, RenderResult } from '../../types/export'
import { hexToColor } from './base'

/**
 * Рендерит изображение
 */
export function renderImage(
  slide: PptxGenJS.Slide,
  node: ImageNode,
  context: RenderContext
): RenderResult {
  const defaultHeight = 2.5
  const height = node.height ? node.height / 96 : defaultHeight // конвертируем px в дюймы

  // Проверяем, является ли URL внешним или base64
  const isBase64 = node.url.startsWith('data:')
  const isUrl = node.url.startsWith('http://') || node.url.startsWith('https://')

  if (isBase64 || isUrl) {
    try {
      slide.addImage({
        path: isUrl ? node.url : undefined,
        data: isBase64 ? node.url : undefined,
        x: context.slideStyle.padding,
        y: context.currentY,
        w: context.contentWidth,
        h: height,
        sizing: { type: 'contain', w: context.contentWidth, h: height },
      })

      // Добавляем подпись если есть alt текст
      if (node.alt) {
        slide.addText(node.alt, {
          x: context.slideStyle.padding,
          y: context.currentY + height + 0.05,
          w: context.contentWidth,
          h: 0.3,
          fontSize: 12,
          color: hexToColor(context.theme.textColor) + '99',
          align: 'center',
          italic: true,
        })
        return { height: height + 0.45 }
      }

      return { height: height + 0.2 }
    } catch {
      // Если не удалось загрузить изображение, показываем placeholder
      return renderImagePlaceholder(slide, node, context, height)
    }
  }

  // Для локальных изображений показываем placeholder
  return renderImagePlaceholder(slide, node, context, height)
}

/**
 * Рендерит placeholder для изображения
 */
function renderImagePlaceholder(
  slide: PptxGenJS.Slide,
  node: ImageNode,
  context: RenderContext,
  height: number
): RenderResult {
  slide.addText(`[Image: ${node.alt || 'Image'}]`, {
    x: context.slideStyle.padding,
    y: context.currentY,
    w: context.contentWidth,
    h: height,
    fontSize: 16,
    color: '9CA3AF',
    align: 'center',
    valign: 'middle',
    fill: { color: 'F3F4F6' },
    line: { color: 'E5E7EB', width: 1, dashType: 'dash' },
  })

  return { height: height + 0.2 }
}
