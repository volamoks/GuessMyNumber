import mermaid from 'mermaid'

/**
 * Рендерит Mermaid диаграмму в SVG Data URL
 * Использование SVG дает векторное качество и избегает проблем безопасности Canvas (tainted canvas)
 */
export async function renderMermaidToImage(definition: string): Promise<string> {
    // Создаем временный контейнер
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.top = '-9999px'
    container.style.visibility = 'hidden'
    document.body.appendChild(container)

    try {
        // Конфигурация для корректного рендеринга
        // ВАЖНО: htmlLabels: false обязательно для поддержки экспорта текста в PPTX
        // PPTX, как и многие SVG конвертеры, не поддерживает foreignObject (HTML внутри SVG)
        mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            flowchart: { htmlLabels: false },
            securityLevel: 'loose',
        })

        // Генерируем ID
        const id = `mermaid-export-${Math.random().toString(36).slice(2)}`

        // Рендерим SVG
        const { svg } = await mermaid.render(id, definition)
        container.innerHTML = svg

        const svgElement = container.querySelector('svg')
        if (!svgElement) throw new Error('SVG not generated')

        // Получаем размеры
        const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 800, 600]
        const width = viewBox[2]
        const height = viewBox[3]

        // Устанавливаем размеры явно (важно для PPTX)
        svgElement.setAttribute('width', String(width))
        svgElement.setAttribute('height', String(height))

        // Обеспечиваем namespace
        svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

        // Хак для принудительного цвета текста (если он белый на белом фоне)
        // Но default theme должна давать черный текст.
        // На всякий случай добавим стиль, но аккуратно
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
        style.textContent = `
      .label { font-family: sans-serif; }
      text { font-family: sans-serif; }
    `
        svgElement.prepend(style)

        // Сериализуем в строку
        const svgData = new XMLSerializer().serializeToString(svgElement)

        // Кодируем в Base64
        const base64 = btoa(unescape(encodeURIComponent(svgData)))

        document.body.removeChild(container)

        return `data:image/svg+xml;base64,${base64}`
    } catch (error) {
        if (document.body.contains(container)) {
            document.body.removeChild(container)
        }
        console.error('Mermaid export failed:', error)
        return ''
    }
}
