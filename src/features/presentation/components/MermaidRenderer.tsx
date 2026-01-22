import { useEffect } from 'react'
import mermaid from 'mermaid'

// Инициализация mermaid один раз
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: 'inherit',
})

interface MermaidRendererProps {
    // Триггер для перерисовки (например, изменение слайда)
    content?: string
}

export function MermaidRenderer({ content }: MermaidRendererProps) {
    useEffect(() => {
        const renderDiagrams = async () => {
            const elements = document.querySelectorAll('.mermaid')

            for (const element of elements) {
                // Если уже отрендерено (имеет svg внутри), пропускаем
                if (element.getAttribute('data-processed') === 'true') continue

                try {
                    const id = element.id || `mermaid-${Math.random().toString(36).slice(2)}`
                    const definition = element.textContent || ''

                    if (!definition.trim()) continue

                    // Рендерим диаграмму
                    const { svg } = await mermaid.render(id + '-svg', definition)
                    element.innerHTML = svg
                    element.setAttribute('data-processed', 'true')
                } catch (error) {
                    console.error('Failed to render mermaid diagram:', error)
                    element.innerHTML = `<div class="text-red-500 text-xs p-2 border border-red-200 bg-red-50 rounded">
            Failed to render diagram. Check syntax.
          </div>`
                }
            }
        }

        // Даем время на рендеринг HTML перед запуском mermaid
        const timeoutId = setTimeout(renderDiagrams, 100)
        return () => clearTimeout(timeoutId)
    }, [content])

    return null // Компонент не рендерит ничего сам, только управляет mermaid
}
