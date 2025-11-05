import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, FileJson, Upload } from 'lucide-react'

interface ActionsBarProps {
  onLoadExample?: () => void
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onExportJSON?: () => void
  onExportPDF?: () => void
  hasData?: boolean
  exampleLabel?: string
  title?: string
  description?: string
}

export function ActionsBar({
  onLoadExample,
  onFileUpload,
  onExportJSON,
  onExportPDF,
  hasData = false,
  exampleLabel = 'Загрузить пример',
  title = 'Действия',
  description = 'Загрузите JSON или создайте с помощью AI',
}: ActionsBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        {onLoadExample && (
          <Button onClick={onLoadExample} variant="outline">
            <FileJson className="mr-2 h-4 w-4" />
            {exampleLabel}
          </Button>
        )}

        {onFileUpload && (
          <label>
            <input type="file" accept=".json" onChange={onFileUpload} className="hidden" />
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Загрузить JSON
              </span>
            </Button>
          </label>
        )}

        {hasData && onExportJSON && (
          <Button onClick={onExportJSON} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Скачать JSON
          </Button>
        )}

        {hasData && onExportPDF && (
          <Button onClick={onExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Экспорт в PDF
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
