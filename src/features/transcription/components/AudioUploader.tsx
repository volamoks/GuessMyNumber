/**
 * Audio Uploader Component
 * Drag & drop file upload for audio files
 */

import { useCallback, useState, useRef } from 'react'
import { Upload, FileAudio, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SUPPORTED_EXTENSIONS } from '../services/whisper-service'
import type { AudioFile } from '../types'

interface AudioUploaderProps {
    onFileSelect: (file: File | null) => void
    audioFile: AudioFile | null
    disabled?: boolean
}

export function AudioUploader({ onFileSelect, audioFile, disabled }: AudioUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        if (!disabled) {
            setIsDragging(true)
        }
    }, [disabled])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        if (disabled) return

        const files = e.dataTransfer.files
        if (files.length > 0) {
            onFileSelect(files[0])
        }
    }, [disabled, onFileSelect])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            onFileSelect(files[0])
        }
    }, [onFileSelect])

    const handleClick = useCallback(() => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click()
        }
    }, [disabled])

    const handleRemove = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onFileSelect(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [onFileSelect])

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
        relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragging
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${audioFile ? 'border-primary/50 bg-primary/5' : ''}
      `}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_EXTENSIONS.join(',')}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />

            {audioFile ? (
                <div className="flex items-center justify-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <FileAudio className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-left">
                        <p className="font-medium text-foreground">{audioFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {formatFileSize(audioFile.size)}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                        className="ml-2"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="mx-auto p-4 bg-muted rounded-full w-fit">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-lg font-medium">
                            Перетащите аудиофайл сюда
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            или нажмите для выбора
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Поддерживаемые форматы: {SUPPORTED_EXTENSIONS.join(', ')} (до 25MB)
                    </p>
                </div>
            )}
        </div>
    )
}
