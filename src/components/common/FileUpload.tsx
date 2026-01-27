import * as React from 'react'
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    onFileSelect: (file: File) => void
    accept?: string
    maxSizeMB?: number
    label?: string
    description?: string
    className?: string
    error?: string
}

export function FileUpload({
    onFileSelect,
    accept = '*/*',
    maxSizeMB = 10,
    label = 'Нажмите или перетащите файл',
    description = 'Поддерживаются любые файлы до 10MB',
    className,
    error: externalError
}: FileUploadProps) {
    const [dragActive, setDragActive] = React.useState(false)
    const [file, setFile] = React.useState<File | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const validateFile = (selectedFile: File) => {
        setError(null)

        // Size validation
        if (selectedFile.size > maxSizeMB * 1024 * 1024) {
            setError(`Файл слишком большой. Максимум ${maxSizeMB}MB`)
            return false
        }

        // Basic type validation if accept is provided (simple comma separated list)
        if (accept !== '*/*') {
            const types = accept.split(',').map(t => t.trim().toLowerCase())
            const extension = `.${selectedFile.name.split('.').pop()?.toLowerCase()}`
            const mimeType = selectedFile.type.toLowerCase()

            const isAccepted = types.some(t =>
                t === extension || t === mimeType || (t.endsWith('/*') && mimeType.startsWith(t.split('/')[0]))
            )

            if (!isAccepted) {
                setError(`Неподдерживаемый тип файла. Форматы: ${accept}`)
                return false
            }
        }

        return true
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0]
            if (validateFile(selectedFile)) {
                setFile(selectedFile)
                onFileSelect(selectedFile)
            }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (validateFile(selectedFile)) {
                setFile(selectedFile)
                onFileSelect(selectedFile)
            }
        }
    }

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setFile(null)
        setError(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    const displayError = externalError || error

    return (
        <div className={cn("space-y-2 w-full", className)}>
            <div
                className={cn(
                    "relative group cursor-pointer border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center gap-3",
                    dragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
                    displayError ? "border-destructive/50 bg-destructive/5" : "",
                    file ? "border-green-500/50 bg-green-500/5" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept={accept}
                />

                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm",
                    file ? "bg-green-500 text-white" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
                )}>
                    {file ? <CheckCircle2 className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>

                <div className="space-y-1">
                    <p className="font-semibold text-sm">
                        {file ? file.name : label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : description}
                    </p>
                </div>

                {file && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={clearFile}
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {displayError && (
                <div className="flex items-center gap-2 text-xs text-destructive animate-in fade-in slide-in-from-top-1 px-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{displayError}</span>
                </div>
            )}
        </div>
    )
}
