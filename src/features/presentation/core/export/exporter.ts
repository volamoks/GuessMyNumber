import PptxGenJS from 'pptxgenjs'
import type { PresentationAST, BlockNode, SlideNode } from '../types/ast'
import type { ExportOptions, RenderContext } from '../types/export'
import { DEFAULT_SLIDE_STYLE } from '../types/theme'
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
    renderMermaid,
    hexToColor,
} from './renderers'

export class PptxExporter {
    private pptx: PptxGenJS
    private options: ExportOptions
    private slideWidth = 10
    private slideHeight = 5.625

    constructor(options: ExportOptions) {
        // @ts-ignore - Handle ESM/CJS interop
        const PptxGen = PptxGenJS.default || PptxGenJS
        this.pptx = new PptxGen()
        this.options = options
        this.setupPresentation()
    }

    private setupPresentation() {
        this.pptx.author = this.options.author || 'Unknown'
        this.pptx.company = this.options.company || ''
        this.pptx.title = this.options.title
        this.pptx.layout = 'LAYOUT_16x9'

        this.pptx.defineSlideMaster({
            title: 'MASTER_SLIDE',
            background: { color: hexToColor(this.options.theme.backgroundColor) },
        })
    }

    public async exportAST(ast: PresentationAST): Promise<void> {
        for (let i = 0; i < ast.slides.length; i++) {
            await this.addSlide(ast.slides[i], i, ast.slides.length)
        }
    }

    private async addSlide(slideNode: SlideNode, index: number, total: number) {
        const pptxSlide = this.pptx.addSlide({ masterName: 'MASTER_SLIDE' })
        const slideStyle = this.options.slideStyle || DEFAULT_SLIDE_STYLE

        // Background Image
        if (this.options.backgroundImage) {
            try {
                const opacity = (this.options.backgroundOpacity || 100) / 100
                pptxSlide.addImage({
                    data: this.options.backgroundImage,
                    x: 0,
                    y: 0,
                    w: this.slideWidth,
                    h: this.slideHeight,
                    sizing: { type: 'cover', w: this.slideWidth, h: this.slideHeight },
                    transparency: Math.round((1 - opacity) * 100),
                })
            } catch (error) {
                console.warn('Failed to add background image:', error)
            }
        }

        const context: RenderContext = {
            theme: this.options.theme,
            slideStyle,
            currentY: slideStyle.padding,
            slideWidth: this.slideWidth,
            slideHeight: this.slideHeight,
            contentWidth: this.slideWidth - (slideStyle.padding || 0.5) * 2,
        }

        // Slide Title
        if (slideNode.title) {
            pptxSlide.addText(slideNode.title, {
                x: slideStyle.padding,
                y: slideStyle.padding,
                w: context.contentWidth,
                h: 0.8,
                fontSize: slideStyle.titleFontSize,
                bold: true,
                color: hexToColor(this.options.theme.primaryColor),
                fontFace: this.options.theme.fontFamily.split(',')[0].trim(),
            })
            context.currentY = slideStyle.padding + 1.0
        }

        // Content
        for (const node of slideNode.children) {
            const result = await this.renderBlockNode(pptxSlide, node, context)
            context.currentY += result.height
        }

        // Logo
        this.renderLogo(pptxSlide)

        // Footer Info
        this.renderFooterInfo(pptxSlide, index, total)

        // Notes
        if (slideNode.notes) {
            pptxSlide.addNotes(slideNode.notes)
        }
    }

    private renderLogo(slide: PptxGenJS.Slide) {
        if (!this.options.logo?.enabled || !this.options.logo.url) return

        try {
            const logoSize = this.options.logo.size
            const margin = 0.2
            let logoX = margin
            let logoY = margin

            switch (this.options.logo.position) {
                case 'top-left': logoX = margin; logoY = margin; break
                case 'top-right': logoX = this.slideWidth - logoSize - margin; logoY = margin; break
                case 'bottom-left': logoX = margin; logoY = this.slideHeight - logoSize - margin; break
                case 'bottom-right': logoX = this.slideWidth - logoSize - margin; logoY = this.slideHeight - logoSize - margin; break
            }

            const opacity = (this.options.logo.opacity || 100) / 100
            slide.addImage({
                data: this.options.logo.url,
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

    private renderFooterInfo(slide: PptxGenJS.Slide, index: number, total: number) {
        const textColor = hexToColor(this.options.theme.textColor)

        if (this.options.includeSlideNumbers !== false) {
            slide.addText(`${index + 1} / ${total}`, {
                x: this.slideWidth - 1,
                y: this.slideHeight - 0.4,
                w: 0.8,
                h: 0.3,
                fontSize: 10,
                color: textColor,
                transparency: 50,
                align: 'right',
            })
        }

        if (this.options.showDate) {
            const date = new Date()
            let dateStr = date.toLocaleDateString()
            if (this.options.dateFormat === 'ISO') dateStr = date.toISOString().split('T')[0]
            else if (this.options.dateFormat === 'US') dateStr = date.toLocaleDateString('en-US')
            else if (this.options.dateFormat === 'EU') dateStr = date.toLocaleDateString('en-GB').replace(/\//g, '.')

            const margin = 0.2
            let x = margin, y = this.slideHeight - 0.4, w = 2, h = 0.3

            if (this.options.datePosition) {
                switch (this.options.datePosition) {
                    case 'top-left': x = margin; y = margin; break
                    case 'top-right': x = this.slideWidth - w - margin; y = margin; break
                    case 'bottom-left': x = margin; y = this.slideHeight - h - margin; break
                    case 'bottom-right': x = this.slideWidth - w - margin; y = this.slideHeight - h - margin; break
                }
            }

            slide.addText(dateStr, {
                x, y, w, h,
                fontSize: 10,
                color: textColor,
                transparency: 50,
                align: (this.options.datePosition as string || '').includes('right') ? 'right' : 'left'
            })
        }

        if (this.options.footer) {
            slide.addText(this.options.footer, {
                x: 2.5,
                y: this.slideHeight - 0.4,
                w: this.slideWidth - 5,
                h: 0.3,
                fontSize: 10,
                color: textColor,
                transparency: 50,
                align: 'center',
            })
        }
    }

    private async renderBlockNode(
        slide: PptxGenJS.Slide,
        node: BlockNode,
        context: RenderContext
    ): Promise<{ height: number }> {
        switch (node.type) {
            case 'heading': return renderHeading(slide, node, context)
            case 'paragraph': return renderParagraph(slide, node, context)
            case 'list': return renderList(slide, node, context)
            case 'code_block': return renderCodeBlock(slide, node, context)
            case 'table': return renderTable(slide, node, context)
            case 'blockquote': return renderBlockquote(slide, node, context)
            case 'image': return renderImage(slide, node, context)
            case 'thematic_break': return { height: 0.3 }
            case 'canvas': return renderCanvas(slide, node, context)
            case 'roadmap': return renderRoadmap(slide, node, context)
            case 'mermaid': return await renderMermaid(slide, node, context)
            default: return { height: 0 }
        }
    }

    public async saveToFile(fileName?: string): Promise<string> {
        const sanitizedTitle = this.options.title.replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '_') || 'Presentation'
        const finalFileName = fileName || `${sanitizedTitle}.pptx`
        await this.pptx.writeFile({ fileName: finalFileName })
        return finalFileName
    }

    public async writeToBlob(): Promise<Blob> {
        return (await this.pptx.write({ outputType: 'blob' })) as Blob
    }
}
