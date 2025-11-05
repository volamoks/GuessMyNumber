import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

interface AIAnalysisResultProps {
  analysis: string
  onImprove?: () => void
  isImproving?: boolean
}

export function AIAnalysisResult({ analysis, onImprove, isImproving = false }: AIAnalysisResultProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Анализ и Рекомендации</CardTitle>
            {onImprove && (
              <CardDescription className="mt-2">
                На основе анализа можно автоматически улучшить данные
              </CardDescription>
            )}
          </div>
          {onImprove && (
            <Button
              onClick={onImprove}
              disabled={isImproving}
              className="gap-2"
            >
              {isImproving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Улучшение...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Применить улучшения
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
            {analysis}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
