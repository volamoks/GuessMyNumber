import { Button } from '@/components/ui/button'
import { Save, Sparkles } from 'lucide-react'

interface ExportActionsProps {
  onSave: () => void
  onAnalyze: () => void
  isSaving: boolean
  isAnalyzing: boolean
}

export function ExportActions({
  onSave,
  onAnalyze,
  isSaving,
  isAnalyzing
}: ExportActionsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onSave} disabled={isSaving} variant="outline">
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? 'Сохранение...' : 'Сохранить'}
      </Button>
      <Button onClick={onAnalyze} disabled={isAnalyzing}>
        <Sparkles className="mr-2 h-4 w-4" />
        {isAnalyzing ? 'Анализирую...' : 'Анализ с AI'}
      </Button>
    </div>
  )
}
