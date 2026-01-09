/**
 * Transcription View Component
 * Displays transcription text and segments
 */

import { useState } from 'react'
import { Copy, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TranscriptionResult } from '../types'

interface TranscriptionViewProps {
    transcription: TranscriptionResult
}

export function TranscriptionView({ transcription }: TranscriptionViewProps) {
    const [copied, setCopied] = useState(false)
    const [showSegments, setShowSegments] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(transcription.text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">Транскрипция</h3>
                    {transcription.duration && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(transcription.duration)}
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    {transcription.segments && transcription.segments.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSegments(!showSegments)}
                        >
                            {showSegments ? 'Скрыть таймкоды' : 'Показать таймкоды'}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-1" />
                                Скопировано
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-1" />
                                Копировать
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                {showSegments && transcription.segments ? (
                    <div className="space-y-2">
                        {transcription.segments.map((segment) => (
                            <div key={segment.id} className="flex gap-3">
                                <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                                    [{formatTime(segment.start)}]
                                </span>
                                <p className="text-sm">{segment.text}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {transcription.text}
                    </p>
                )}
            </div>
        </div>
    )
}
