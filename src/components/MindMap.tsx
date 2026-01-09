
import { useEffect, useRef } from 'react'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'
import { Toolbar } from 'markmap-toolbar'
import 'markmap-toolbar/dist/style.css'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

const transformer = new Transformer()

interface MindMapProps {
    markdown: string
    className?: string
}

export function MindMap({ markdown, className = "h-[500px] w-full" }: MindMapProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const mmRef = useRef<Markmap | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!svgRef.current || !markdown) return

        // Wait for layout to be ready
        const initMarkmap = () => {
            if (!svgRef.current) return

            // Check if element has dimensions
            const rect = svgRef.current.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) {
                // Retry soon if still hidden/zero-size
                requestAnimationFrame(initMarkmap)
                return
            }

            // 1. Transform markdown
            const { root } = transformer.transform(markdown)

            // 2. Create or update markmap
            if (mmRef.current) {
                mmRef.current.setData(root)
                mmRef.current.fit()
            } else {
                mmRef.current = Markmap.create(svgRef.current, {
                    autoFit: true,
                    zoom: true,
                    pan: true,
                }, root)

                // 3. Attach toolbar only on create
                if (containerRef.current) {
                    const toolbar = Toolbar.create(mmRef.current)
                    const toolbarEl = (toolbar as any).el as HTMLElement
                    toolbarEl.style.position = 'absolute'
                    toolbarEl.style.bottom = '1rem'
                    toolbarEl.style.right = '1rem'
                    containerRef.current.appendChild(toolbarEl)
                }
            }
        }

        // Slight delay to allow tab animation/rendering to finish
        const timer = setTimeout(() => {
            requestAnimationFrame(initMarkmap)
        }, 100)

        // Cleanup
        return () => {
            clearTimeout(timer)
            if (mmRef.current) {
                mmRef.current.destroy()
                mmRef.current = null
            }
            // Remove toolbar manually if needed
            if (containerRef.current) {
                const toolbars = containerRef.current.querySelectorAll('.mm-toolbar')
                toolbars.forEach(el => el.remove())
            }
        }
    }, [markdown])


    const handleDownload = () => {
        if (!svgRef.current) return

        // Simple SVG download logic
        const svgData = new XMLSerializer().serializeToString(svgRef.current)
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'mindmap.svg'
        link.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div ref={containerRef} className={`relative border rounded-lg overflow-hidden bg-white ${className}`}>
            <div className="absolute top-2 right-2 z-10 flex gap-2">
                <Button size="icon" variant="outline" onClick={handleDownload} title="Download SVG">
                    <Download className="w-4 h-4" />
                </Button>
            </div>
            <svg ref={svgRef} className="w-full h-full" />
        </div>
    )
}
