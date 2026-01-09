import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { extractTextFromPDF } from '../utils/pdf-parser'
import { toast } from 'sonner'

interface PDFUploaderProps {
    onUpload: (text: string, fileName: string) => void
    disabled?: boolean
}

export function PDFUploader({ onUpload, disabled }: PDFUploaderProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file')
            return
        }

        setIsUploading(true)
        try {
            const text = await extractTextFromPDF(file)
            onUpload(text, file.name)
            toast.success('PDF uploaded and parsed successfully')
        } catch (error) {
            console.error(error)
            toast.error('Failed to parse PDF')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    return (
        <div className="w-full">
            <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || isUploading}
            />
            <Button
                variant="outline"
                className="w-full border-dashed"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isUploading}
            >
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Parsing PDF...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload PDF Reference
                    </>
                )}
            </Button>
        </div>
    )
}
