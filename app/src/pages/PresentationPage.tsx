import { useState } from 'react'
import { MarkdownEditor } from '@/components/presentation/MarkdownEditor'
import { SlidePreview } from '@/components/presentation/SlidePreview'
import { PresentationControls } from '@/components/presentation/PresentationControls'
import { SlideThumbnails } from '@/components/presentation/SlideThumbnails'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, X } from 'lucide-react'
import { MARKDOWN_CHEATSHEET } from '@/lib/markdown-rules'

export function PresentationPage() {
  const [showCheatsheet, setShowCheatsheet] = useState(false)

  return (
    <div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Presentation Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create presentations from Markdown and export to PPTX
          </p>
        </div>
        <Button
          variant={showCheatsheet ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowCheatsheet(!showCheatsheet)}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Markdown Шпаргалка
        </Button>
      </header>

      {/* Cheatsheet Panel */}
      {showCheatsheet && (
        <Card className="mx-6 mt-4 p-4 bg-muted/50 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={() => setShowCheatsheet(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Основы</h4>
              <pre className="text-xs font-mono bg-background p-2 rounded whitespace-pre-wrap">
{`# H1 Заголовок
## H2 Подзаголовок
### H3 Раздел

**жирный** | *курсив* | \`код\`

- Маркированный список
1. Нумерованный список
- [ ] Чекбокс задачи

> Цитата

[ссылка](url) | ![картинка](url)`}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Таблицы и код</h4>
              <pre className="text-xs font-mono bg-background p-2 rounded whitespace-pre-wrap">
{`| Заголовок | Заголовок |
|-----------|-----------|
| Ячейка    | Ячейка    |

\`\`\`javascript
const code = "блок кода";
\`\`\`

<kbd>Ctrl</kbd> - клавиша
<mark>выделение</mark>

--- (разделить слайды)`}
              </pre>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Все стили применяются автоматически через класс <code className="bg-muted px-1 rounded">prose</code>
          </p>
        </Card>
      )}

      {/* Controls */}
      <PresentationControls />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails sidebar */}
        <div className="w-48 border-r bg-muted/20 overflow-y-auto">
          <div className="p-3 border-b bg-muted/50">
            <h3 className="font-semibold text-sm">Slides</h3>
          </div>
          <SlideThumbnails />
        </div>

        {/* Editor */}
        <div className="flex-1 border-r">
          <Card className="h-full rounded-none border-0">
            <MarkdownEditor />
          </Card>
        </div>

        {/* Preview */}
        <div className="flex-1 bg-muted/20 flex flex-col">
          <div className="p-3 border-b bg-muted/50">
            <h3 className="font-semibold text-sm">Preview (с prose стилями)</h3>
          </div>
          <div className="flex-1 p-6 flex items-center justify-center overflow-auto">
            <div className="w-full max-w-4xl">
              <SlidePreview className="shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
