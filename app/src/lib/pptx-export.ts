import PptxGenJS from 'pptxgenjs'
import type { Slide, PresentationTheme } from './presentation-types'
import { extractBulletPoints } from './markdown-slides'

interface ExportOptions {
  title: string
  author?: string
  theme: PresentationTheme
}

/**
 * Экспортирует слайды в PPTX файл
 */
export async function exportToPptx(slides: Slide[], options: ExportOptions): Promise<void> {
  const pptx = new PptxGenJS()

  // Настройка презентации
  pptx.author = options.author || 'Unknown'
  pptx.company = ''
  pptx.title = options.title

  // Настройка темы
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: options.theme.backgroundColor.replace('#', '') },
  })

  // Генерация слайдов
  for (const slide of slides) {
    const pptxSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' })

    // Заголовок слайда
    pptxSlide.addText(slide.title, {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: options.theme.primaryColor.replace('#', ''),
      fontFace: options.theme.fontFamily.split(',')[0].trim(),
    })

    let yPosition = 1.3

    // Контент слайда
    for (const content of slide.content) {
      switch (content.type) {
        case 'text':
          pptxSlide.addText(content.content, {
            x: 0.5,
            y: yPosition,
            w: '90%',
            h: 0.6,
            fontSize: 18,
            color: options.theme.textColor.replace('#', ''),
            fontFace: options.theme.fontFamily.split(',')[0].trim(),
          })
          yPosition += 0.7
          break

        case 'bullets': {
          const bullets = extractBulletPoints(content.content)
          const bulletText = bullets.map(text => ({
            text,
            options: {
              bullet: true,
              indentLevel: 0,
            },
          }))

          pptxSlide.addText(bulletText, {
            x: 0.5,
            y: yPosition,
            w: '90%',
            h: bullets.length * 0.5,
            fontSize: 20,
            color: options.theme.textColor.replace('#', ''),
            fontFace: options.theme.fontFamily.split(',')[0].trim(),
            lineSpacing: 28,
          })
          yPosition += bullets.length * 0.5 + 0.3
          break
        }

        case 'code':
          pptxSlide.addText(content.content, {
            x: 0.5,
            y: yPosition,
            w: '90%',
            h: content.content.split('\n').length * 0.3 + 0.4,
            fontSize: 14,
            fontFace: options.theme.codeFontFamily.split(',')[0].trim(),
            color: '2d3748',
            fill: { color: 'f7fafc' },
            line: { color: 'e2e8f0', width: 1 },
            margin: 10,
          })
          yPosition += content.content.split('\n').length * 0.3 + 0.6
          break

        case 'image':
          // Для изображений добавляем placeholder
          pptxSlide.addText(`[Image: ${content.options?.alt || 'Image'}]`, {
            x: 0.5,
            y: yPosition,
            w: '90%',
            h: 2,
            fontSize: 16,
            color: '9ca3af',
            align: 'center',
            valign: 'middle',
            fill: { color: 'f3f4f6' },
            line: { color: 'e5e7eb', width: 1, dashType: 'dash' },
          })
          yPosition += 2.3
          break
      }
    }

    // Speaker notes
    if (slide.notes) {
      pptxSlide.addNotes(slide.notes)
    }
  }

  // Скачивание файла
  const fileName = `${options.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx`
  await pptx.writeFile({ fileName })
}

/**
 * Экспорт в Blob для предпросмотра или других целей
 */
export async function exportToPptxBlob(slides: Slide[], options: ExportOptions): Promise<Blob> {
  const pptx = new PptxGenJS()

  pptx.author = options.author || 'Unknown'
  pptx.title = options.title

  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: options.theme.backgroundColor.replace('#', '') },
  })

  for (const slide of slides) {
    const pptxSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' })

    pptxSlide.addText(slide.title, {
      x: 0.5,
      y: 0.3,
      w: '90%',
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: options.theme.primaryColor.replace('#', ''),
    })

    let yPosition = 1.3

    for (const content of slide.content) {
      if (content.type === 'bullets') {
        const bullets = extractBulletPoints(content.content)
        const bulletText = bullets.map(text => ({
          text,
          options: { bullet: true },
        }))

        pptxSlide.addText(bulletText, {
          x: 0.5,
          y: yPosition,
          w: '90%',
          fontSize: 20,
          color: options.theme.textColor.replace('#', ''),
        })
        yPosition += bullets.length * 0.5 + 0.3
      } else if (content.type === 'text') {
        pptxSlide.addText(content.content, {
          x: 0.5,
          y: yPosition,
          w: '90%',
          fontSize: 18,
          color: options.theme.textColor.replace('#', ''),
        })
        yPosition += 0.7
      }
    }
  }

  return await pptx.write({ outputType: 'blob' }) as Blob
}
