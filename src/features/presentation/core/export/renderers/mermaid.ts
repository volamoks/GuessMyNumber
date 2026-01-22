import type PptxGenJS from 'pptxgenjs'
import type { MermaidNode } from '../../types/ast'
import type { RenderContext, RenderResult } from '../../types/export'
import { renderMermaidToImage } from '../helpers/mermaid-utils'

/**
 * Рендерит Mermaid диаграмму в слайд
 */
export async function renderMermaid(
    slide: PptxGenJS.Slide,
    node: MermaidNode,
    context: RenderContext
): Promise<RenderResult> {
    try {
        const imageData = await renderMermaidToImage(node.value)

        if (!imageData) {
            // Fallback text if export fails
            slide.addText('Mermaid Diagram (Export Failed)', {
                x: context.slideStyle.padding,
                y: context.currentY,
                w: context.contentWidth,
                h: 1,
                color: 'FF0000',
                fontSize: 12
            })
            return { height: 1.2 }
        }

        // Default height suitable for diagrams
        const height = 4.5
        // Ensure it fits within remaining space
        const maxHeight = context.slideHeight - context.currentY - context.slideStyle.padding
        const finalHeight = Math.min(height, Math.max(1, maxHeight))

        slide.addImage({
            data: imageData,
            x: context.slideStyle.padding,
            y: context.currentY,
            w: context.contentWidth,
            h: finalHeight,
            sizing: { type: 'contain', w: context.contentWidth, h: finalHeight }
        })

        return { height: finalHeight + 0.2 }
    } catch (error) {
        console.error('Error rendering mermaid block:', error)
        return { height: 0 }
    }
}
