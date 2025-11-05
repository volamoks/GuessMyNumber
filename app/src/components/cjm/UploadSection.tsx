import { Button } from '@/components/ui/button'
import { Upload, FileDown, Wand2 } from 'lucide-react'

interface UploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onLoadExample: () => void
  onToggleGenerator: () => void
  showGenerator: boolean
}

export function UploadSection({
  onFileUpload,
  onLoadExample,
  onToggleGenerator,
  showGenerator
}: UploadSectionProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
            <div className="text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Загрузить JSON
              </p>
            </div>
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".json"
            className="hidden"
            onChange={onFileUpload}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <Button onClick={onLoadExample} variant="outline" className="h-24">
          <div className="flex flex-col items-center">
            <FileDown className="h-6 w-6 mb-1" />
            <span>Загрузить пример</span>
          </div>
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Button
          onClick={onToggleGenerator}
          variant={showGenerator ? "default" : "outline"}
          className="h-24"
        >
          <div className="flex flex-col items-center">
            <Wand2 className="h-6 w-6 mb-1" />
            <span>Создать с AI</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
