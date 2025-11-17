import { useEffect, useRef } from 'react'
import { usePresentationStore } from '@/store/presentationStore'
import { parseMarkdownToSlides } from '@/lib/markdown-slides'

export function MarkdownEditor() {
  const { markdown, setMarkdown, setSlides } = usePresentationStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Парсим markdown в слайды при изменении
  useEffect(() => {
    const slides = parseMarkdownToSlides(markdown)
    setSlides(slides)
  }, [markdown, setSlides])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab для отступов
    if (e.key === 'Tab') {
      e.preventDefault()
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = markdown.substring(0, start) + '  ' + markdown.substring(end)
      setMarkdown(newValue)

      // Восстанавливаем позицию курсора
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      }, 0)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-muted/50">
        <h3 className="font-semibold text-sm">Markdown Editor</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Use <code className="bg-muted px-1 rounded">---</code> to separate slides
        </p>
      </div>
      <textarea
        ref={textareaRef}
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-background"
        placeholder="# Slide Title&#10;&#10;Your content here...&#10;&#10;---&#10;&#10;# Next Slide"
        spellCheck={false}
      />
    </div>
  )
}
