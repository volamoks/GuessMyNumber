import { toast } from 'sonner'
import { usePresentationStore } from '@/store'
import { exportToPptx } from '@/features/presentation/services/pptx-export'

export function usePresentationExport() {
    const store = usePresentationStore()
    const { slides, theme, markdown, settings, currentPresentation, currentSlideIndex } = store

    const getFinalTitle = () => {
        const h1Match = markdown.match(/^#\s+(.+)$/m)
        const extractedTitle = h1Match ? h1Match[1].trim() : 'Presentation'
        const currentTitle = currentPresentation?.title || extractedTitle
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(currentTitle)
        return isUuid ? extractedTitle : currentTitle
    }

    const handleExportPptx = async () => {
        if (slides.length === 0) {
            toast.error('No slides to export')
            return
        }

        const finalTitle = getFinalTitle()
        store.setIsExporting(true)

        try {
            await exportToPptx(slides, {
                title: finalTitle,
                author: settings.author || currentPresentation?.author,
                company: settings.company,
                theme: theme,
                slideStyle: settings.slideStyle,
                slideSize: settings.layout,
                logo: settings.logo,
                backgroundImage: settings.backgroundImage,
                backgroundOpacity: settings.backgroundOpacity,
                footer: settings.footer,
                showDate: settings.showDate,
            }, markdown)
            toast.success('Презентация успешно экспортирована!')
        } catch (err) {
            console.error('Export failed:', err)
            toast.error('Ошибка при экспорте презентации')
        } finally {
            store.setIsExporting(false)
        }
    }

    const handleExportPdf = async () => {
        if (slides.length === 0) {
            toast.error('No slides to export')
            return
        }

        store.setIsExporting(true)
        const toastId = toast.loading('Подготовка PDF...')

        try {
            const { jsPDF } = await import('jspdf')
            const html2canvas = (await import('html2canvas')).default

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [1920, 1080],
            })

            const finalTitle = getFinalTitle()
            const originalIndex = currentSlideIndex

            for (let i = 0; i < slides.length; i++) {
                toast.loading(`Рендеринг слайда ${i + 1} из ${slides.length}...`, { id: toastId })

                store.setCurrentSlideIndex(i)
                await new Promise(resolve => setTimeout(resolve, 500))

                const mainPreview = document.querySelector('.flex-1.p-4.flex.items-center.justify-center.overflow-auto .aspect-video')

                if (mainPreview) {
                    const canvas = await html2canvas(mainPreview as HTMLElement, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: theme.backgroundColor,
                    })

                    const imgData = canvas.toDataURL('image/jpeg', 0.95)

                    if (i > 0) pdf.addPage()
                    pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080)
                }
            }

            store.setCurrentSlideIndex(originalIndex)

            const sanitizedTitle = finalTitle.replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '_') || 'Presentation'
            pdf.save(`${sanitizedTitle}.pdf`)

            toast.success('PDF успешно экспортирован!', { id: toastId })
        } catch (err) {
            console.error('PDF export failed:', err)
            toast.error('Ошибка при экспорте PDF', { id: toastId })
        } finally {
            store.setIsExporting(false)
        }
    }

    return { handleExportPptx, handleExportPdf }
}
