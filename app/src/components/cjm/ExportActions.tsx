import { Button } from '@/components/ui/button'
import { Download, FileDown, Save, Sparkles } from 'lucide-react'

interface ExportActionsProps {
  onExportJSON: () => void
  onExportPDF: () => void
  onSave: () => void
  onAnalyze: () => void
  isExporting: boolean
  isSaving: boolean
  isAnalyzing: boolean
}

export function ExportActions({
  onExportJSON,
  onExportPDF,
  onSave,
  onAnalyze,
  isExporting,
  isSaving,
  isAnalyzing
}: ExportActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={onExportJSON} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        JSON
      </Button>
      <Button
        onClick={onExportPDF}
        disabled={isExporting}
        variant="outline"
        size="sm"
      >
        <FileDown className="mr-2 h-4 w-4" />
        {isExporting ? 'Экспорт...' : 'PDF'}
      </Button>
      <Button onClick={onSave} disabled={isSaving} variant="outline" size="sm">
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? 'Сохранение...' : 'Сохранить'}
      </Button>
      <Button onClick={onAnalyze} disabled={isAnalyzing} size="sm">
        <Sparkles className="mr-2 h-4 w-4" />
        {isAnalyzing ? 'Анализирую...' : 'Анализ с AI'}
      </Button>
    </div>
  )
}
