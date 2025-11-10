/**
 * File Upload Zone Component
 * Unified file upload interface with drag-and-drop visual
 */

import { Button } from '@/components/ui/button'
import { Upload, FileDown, Wand2 } from 'lucide-react'

export interface FileUploadZoneProps {
  /** File upload handler */
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Load example handler */
  onLoadExample?: () => void
  /** Toggle AI generator handler */
  onToggleGenerator?: () => void
  /** Whether AI generator is active */
  showGenerator?: boolean
  /** Accepted file types (default: .json) */
  acceptedFileTypes?: string
  /** Upload zone label */
  uploadLabel?: string
  /** Load example button label */
  exampleLabel?: string
  /** AI generator button label */
  generatorLabel?: string
  /** Layout variant */
  variant?: 'compact' | 'expanded'
  /** Additional className */
  className?: string
}

/**
 * FileUploadZone - Reusable file upload component
 *
 * Supports optional actions - only renders buttons for provided handlers
 *
 * @example
 * ```tsx
 * // Full featured
 * <FileUploadZone
 *   onFileUpload={handleFileUpload}
 *   onLoadExample={handleLoadExample}
 *   onToggleGenerator={handleToggleGenerator}
 *   showGenerator={showGenerator}
 *   variant="expanded"
 * />
 *
 * // Simple upload only
 * <FileUploadZone
 *   onFileUpload={handleFileUpload}
 *   variant="compact"
 * />
 * ```
 */
export function FileUploadZone({
  onFileUpload,
  onLoadExample,
  onToggleGenerator,
  showGenerator = false,
  acceptedFileTypes = '.json',
  uploadLabel = 'Загрузить JSON',
  exampleLabel = 'Загрузить пример',
  generatorLabel = 'Создать с AI',
  variant = 'expanded',
  className = '',
}: FileUploadZoneProps) {
  const isCompact = variant === 'compact'
  const uploadHeight = isCompact ? 'h-24' : 'h-32'
  const iconSize = isCompact ? 'h-8 w-8' : 'h-12 w-12'

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      {/* Upload Zone */}
      <div className={isCompact ? 'flex-1 min-w-[200px]' : 'flex-1'}>
        <label htmlFor="file-upload" className="cursor-pointer">
          <div
            className={`flex items-center justify-center w-full ${uploadHeight} border-2 border-dashed rounded-lg hover:border-primary transition-colors`}
          >
            <div className="text-center">
              <Upload className={`mx-auto ${iconSize} text-muted-foreground`} />
              <p className="mt-2 text-sm text-muted-foreground">
                {uploadLabel}
              </p>
            </div>
          </div>
          <input
            id="file-upload"
            type="file"
            accept={acceptedFileTypes}
            className="hidden"
            onChange={onFileUpload}
          />
        </label>
      </div>

      {/* Action Buttons */}
      {(onLoadExample || onToggleGenerator) && (
        <div className="flex flex-col gap-2">
          {onLoadExample && (
            <Button
              onClick={onLoadExample}
              variant="outline"
              className={uploadHeight}
            >
              <div className="flex flex-col items-center">
                <FileDown className="h-6 w-6 mb-1" />
                <span>{exampleLabel}</span>
              </div>
            </Button>
          )}

          {onToggleGenerator && (
            <Button
              onClick={onToggleGenerator}
              variant={showGenerator ? 'default' : 'outline'}
              className={uploadHeight}
            >
              <div className="flex flex-col items-center">
                <Wand2 className="h-6 w-6 mb-1" />
                <span>{generatorLabel}</span>
              </div>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
