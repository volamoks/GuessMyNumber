import { Button } from '@/components/ui/button'
import { Upload, FileDown } from 'lucide-react'

interface UploadSectionProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onLoadExample: () => void
}

export function UploadSection({ onFileUpload, onLoadExample }: UploadSectionProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg hover:border-primary transition-colors">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Нажмите для загрузки JSON
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
      <div className="flex items-center">
        <Button onClick={onLoadExample} variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Загрузить пример
        </Button>
      </div>
    </div>
  )
}
