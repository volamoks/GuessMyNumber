import { useEffect, useRef } from 'react'
import { usePresentationStore } from '@/store'
import { parseMarkdownToSlides } from '@/features/presentation/utils/markdown-slides'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  List,
  Heading1,
  Image as ImageIcon,
  SplitSquareHorizontal,
  Code
} from 'lucide-react'

export function MarkdownEditor() {
  const { markdown, setMarkdown, setSlides } = usePresentationStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Парсим markdown в слайды при изменении
  useEffect(() => {
    const slides = parseMarkdownToSlides(markdown)
    setSlides(slides)
  }, [markdown, setSlides])

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = markdown.substring(start, end)

    const newText = markdown.substring(0, start) +
      before + selectedText + after +
      markdown.substring(end)

    setMarkdown(newText)

    // Restore cursor / selection
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        end + before.length
      )
    }, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab для отступов
    if (e.key === 'Tab') {
      e.preventDefault()
      insertText('  ')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b bg-muted/50 flex items-center gap-1 overflow-x-auto">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertText('**', '**')}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertText('*', '*')}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertText('# ')}
          title="Heading"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertText('- ')}
          title="List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertText('```\n', '\n```')}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertText('![Alt text](', ')')}
          title="Image"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="secondary"
          size="sm"
          className="h-8 text-xs"
          onClick={() => insertText('\n\n---\n\n# New Slide\n')}
          title="New Slide"
        >
          <SplitSquareHorizontal className="h-3 w-3 mr-2" />
          New Slide
        </Button>
      </div>
      <textarea
        ref={textareaRef}
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-background leading-relaxed"
        placeholder="# Slide Title&#10;&#10;Your content here...&#10;&#10;---&#10;&#10;# Next Slide"
        spellCheck={false}
      />
    </div>
  )
}
