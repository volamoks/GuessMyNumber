/**
 * Экспорт презентации в PDF
 * Использует html2canvas для рендеринга слайдов и jsPDF для создания PDF
 */

import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export interface PdfExportOptions {
    title: string
    quality?: number // 0.1 - 1.0, default 0.92
}

/**
 * Экспортирует презентацию в PDF из DOM элементов слайдов
 */
export async function exportToPdf(
    slideElements: HTMLElement[],
    options: PdfExportOptions
): Promise<void> {
    if (slideElements.length === 0) {
        throw new Error('No slides to export')
    }

    // Создаём PDF в альбомной ориентации (16:9)
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1920, 1080], // 16:9 aspect ratio
    })

    const quality = options.quality || 0.92

    for (let i = 0; i < slideElements.length; i++) {
        const element = slideElements[i]

        // Рендерим слайд в canvas
        const canvas = await html2canvas(element, {
            scale: 2, // Высокое разрешение
            useCORS: true,
            logging: false,
            backgroundColor: null,
        })

        // Конвертируем в изображение
        const imgData = canvas.toDataURL('image/jpeg', quality)

        // Добавляем страницу (кроме первой)
        if (i > 0) {
            pdf.addPage()
        }

        // Добавляем изображение на всю страницу
        pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080)
    }

    // Скачиваем файл
    const sanitizedTitle = options.title.replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '_') || 'Presentation'
    pdf.save(`${sanitizedTitle}.pdf`)
}

/**
 * Экспортирует PDF рендеря каждый слайд по очереди
 * Принимает функцию рендеринга слайда
 */
export async function exportSlidesPdf(
    totalSlides: number,
    renderSlide: (index: number) => Promise<HTMLElement>,
    options: PdfExportOptions
): Promise<void> {
    const slides: HTMLElement[] = []

    for (let i = 0; i < totalSlides; i++) {
        const slide = await renderSlide(i)
        slides.push(slide)
    }

    return exportToPdf(slides, options)
}
