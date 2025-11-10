/**
 * Unified Export Actions Component
 * Reusable action buttons for export, save, and analyze operations
 */

import { LoadingButton } from './LoadingButton'
import { Download, FileDown, Save, Sparkles } from 'lucide-react'

export interface ExportAction {
  /** Action handler */
  onClick: () => void
  /** Loading state for this action */
  isLoading?: boolean
  /** Custom label (optional) */
  label?: string
  /** Custom loading label (optional) */
  loadingLabel?: string
}

export interface UnifiedExportActionsProps {
  /** Export to JSON action */
  onExportJSON?: ExportAction
  /** Export to PDF action */
  onExportPDF?: ExportAction
  /** Save action */
  onSave?: ExportAction
  /** AI analysis action */
  onAnalyze?: ExportAction
  /** Layout direction */
  layout?: 'row' | 'column'
  /** Additional className */
  className?: string
}

/**
 * UnifiedExportActions - Flexible export/action buttons component
 *
 * Supports optional actions - only renders buttons for provided actions
 *
 * @example
 * ```tsx
 * // All actions
 * <UnifiedExportActions
 *   onExportJSON={{ onClick: handleExportJSON }}
 *   onExportPDF={{ onClick: handleExportPDF, isLoading: isExporting }}
 *   onSave={{ onClick: handleSave, isLoading: isSaving }}
 *   onAnalyze={{ onClick: handleAnalyze, isLoading: isAnalyzing }}
 * />
 *
 * // Only save and analyze
 * <UnifiedExportActions
 *   onSave={{ onClick: handleSave, isLoading: isSaving }}
 *   onAnalyze={{ onClick: handleAnalyze, isLoading: isAnalyzing }}
 * />
 * ```
 */
export function UnifiedExportActions({
  onExportJSON,
  onExportPDF,
  onSave,
  onAnalyze,
  layout = 'row',
  className = '',
}: UnifiedExportActionsProps) {
  const wrapperClass =
    layout === 'row' ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'

  return (
    <div className={`${wrapperClass} ${className}`}>
      {onExportJSON && (
        <LoadingButton
          label={onExportJSON.label || 'JSON'}
          loadingLabel={onExportJSON.loadingLabel || 'Экспорт...'}
          icon={Download}
          isLoading={onExportJSON.isLoading}
          onClick={onExportJSON.onClick}
          variant="outline"
          size="sm"
        />
      )}

      {onExportPDF && (
        <LoadingButton
          label={onExportPDF.label || 'PDF'}
          loadingLabel={onExportPDF.loadingLabel || 'Экспорт...'}
          icon={FileDown}
          isLoading={onExportPDF.isLoading}
          onClick={onExportPDF.onClick}
          variant="outline"
          size="sm"
        />
      )}

      {onSave && (
        <LoadingButton
          label={onSave.label || 'Сохранить'}
          loadingLabel={onSave.loadingLabel || 'Сохранение...'}
          icon={Save}
          isLoading={onSave.isLoading}
          onClick={onSave.onClick}
          variant="outline"
          size="sm"
        />
      )}

      {onAnalyze && (
        <LoadingButton
          label={onAnalyze.label || 'Анализ с AI'}
          loadingLabel={onAnalyze.loadingLabel || 'Анализирую...'}
          icon={Sparkles}
          isLoading={onAnalyze.isLoading}
          onClick={onAnalyze.onClick}
          size="sm"
        />
      )}
    </div>
  )
}
