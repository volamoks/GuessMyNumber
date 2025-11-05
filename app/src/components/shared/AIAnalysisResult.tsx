import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface AIAnalysisResultProps {
  analysis: string
}

export function AIAnalysisResult({ analysis }: AIAnalysisResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Анализ</CardTitle>
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
