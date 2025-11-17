import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MarkdownPreview } from '@/components/shared/MarkdownPreview'
import { MARKDOWN_FULL_EXAMPLE, MARKDOWN_CHEATSHEET } from '@/lib/markdown-rules'
import { Copy, Download, FileText, BookOpen, Eye, Code } from 'lucide-react'

type ViewMode = 'split' | 'editor' | 'preview'

export function DocumentationPage() {
  const [markdown, setMarkdown] = useState(MARKDOWN_FULL_EXAMPLE)
  const [viewMode, setViewMode] = useState<ViewMode>('split')
  const [showCheatsheet, setShowCheatsheet] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdown)
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportHTML = () => {
    // Создаём полный HTML документ
    const htmlContent = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Documentation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.75;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      color: #1e293b;
    }
    h1 { font-size: 2.25rem; font-weight: 800; border-bottom: 2px solid #d1d5db; padding-bottom: 0.5rem; }
    h2 { font-size: 1.875rem; font-weight: 700; border-bottom: 1px solid #d1d5db; padding-bottom: 0.3rem; margin-top: 2.5rem; }
    h3 { font-size: 1.5rem; font-weight: 600; margin-top: 2rem; }
    code { font-family: 'JetBrains Mono', monospace; background: #f3f4f6; padding: 0.2em 0.4em; border-radius: 0.25rem; color: #ef4444; }
    pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; }
    pre code { background: transparent; color: inherit; padding: 0; }
    table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
    th, td { border: 1px solid #d1d5db; padding: 0.75rem 1rem; text-align: left; }
    th { background: #f3f4f6; font-weight: 600; }
    tr:nth-child(even) { background: #f3f4f6; }
    blockquote { border-left: 4px solid #6366f1; padding: 1rem; background: #f3f4f6; margin: 1.5rem 0; font-style: italic; }
    a { color: #6366f1; text-decoration: underline; }
    kbd { font-family: monospace; background: #f3f4f6; border: 1px solid #d1d5db; padding: 0.125rem 0.375rem; border-radius: 0.25rem; box-shadow: 0 1px 0 #d1d5db; }
    mark { background: #fef08a; padding: 0.125rem 0.25rem; }
    hr { border: none; border-top: 2px solid #d1d5db; margin: 3rem 0; }
    details { border: 1px solid #d1d5db; padding: 1rem; border-radius: 0.5rem; margin: 1.25rem 0; }
    summary { font-weight: 600; cursor: pointer; }
    ul, ol { padding-left: 1.625rem; }
    li { margin: 0.5rem 0; }
  </style>
</head>
<body>
  <div class="prose">
    ${document.querySelector('.prose')?.innerHTML || ''}
  </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.16)-theme(spacing.12))] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Markdown Documentation</h1>
          <p className="text-sm text-muted-foreground">
            Пишите документацию с автоматическим форматированием
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'editor' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('editor')}
              className="rounded-r-none"
            >
              <Code className="h-4 w-4 mr-1" />
              Редактор
            </Button>
            <Button
              variant={viewMode === 'split' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              className="rounded-none border-x"
            >
              <FileText className="h-4 w-4 mr-1" />
              Split
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="rounded-l-none"
            >
              <Eye className="h-4 w-4 mr-1" />
              Превью
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCheatsheet(!showCheatsheet)}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Шпаргалка
          </Button>

          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>

          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            .md
          </Button>

          <Button variant="default" size="sm" onClick={handleExportHTML}>
            <Download className="h-4 w-4 mr-1" />
            .html
          </Button>
        </div>
      </div>

      {/* Cheatsheet Panel */}
      {showCheatsheet && (
        <Card className="mb-4 p-4 bg-muted/50 max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">{MARKDOWN_CHEATSHEET}</pre>
        </Card>
      )}

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Editor */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <Card className={`flex flex-col ${viewMode === 'split' ? 'flex-1' : 'w-full'}`}>
            <div className="p-3 border-b bg-muted/50 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Markdown Editor</h3>
              <span className="text-xs text-muted-foreground">
                {markdown.length} символов | {markdown.split('\n').length} строк
              </span>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-background"
              placeholder="# Начните писать документацию..."
              spellCheck={false}
            />
          </Card>
        )}

        {/* Preview */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <Card className={`flex flex-col ${viewMode === 'split' ? 'flex-1' : 'w-full'}`}>
            <div className="p-3 border-b bg-muted/50">
              <h3 className="font-semibold text-sm">Preview</h3>
            </div>
            <div className="flex-1 p-6 overflow-y-auto bg-background">
              <MarkdownPreview content={markdown} fullWidth />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
