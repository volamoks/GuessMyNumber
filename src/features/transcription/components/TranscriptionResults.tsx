import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MindMap } from '@/components/MindMap'
import { Edit, Check, X, Download, Copy, RefreshCw, Layers } from 'lucide-react'
import { MarkdownDisplay } from '@/components/shared/MarkdownDisplay'
import { toast } from 'sonner'
import type { SavedTranscription } from '../types'
import { cn } from '@/lib/utils'
import { useTranscriptionStore } from '../store/transcriptionStore'

interface TranscriptionResultsProps {
    activeResult: SavedTranscription | null
    onReAnalyze: (templateId: string) => void
    isProcessing: boolean
    templates: any[]
}

export function TranscriptionResults({ activeResult, onReAnalyze, isProcessing, templates }: TranscriptionResultsProps) {
    const [isEditingMindmap, setIsEditingMindmap] = useState(false)
    const [mindmapContent, setMindmapContent] = useState('')
    const { updateTranscription } = useTranscriptionStore()
    const [selectedReAnalyzeTemplate, setSelectedReAnalyzeTemplate] = useState<string>(templates[0]?.id || 'general')

    useEffect(() => {
        if (activeResult?.summary?.mindmap) {
            setMindmapContent(activeResult.summary.mindmap)
        } else {
            setMindmapContent('')
        }
        setIsEditingMindmap(false)
    }, [activeResult])

    const handleSaveMindmap = async () => {
        if (!activeResult) return
        await updateTranscription(activeResult.id, {
            summary: {
                ...activeResult.summary!,
                mindmap: mindmapContent
            }
        })
        setIsEditingMindmap(false)
        toast.success('Майндмап обновлен')
    }

    const handleExport = (format: 'md' | 'txt' | 'json') => {
        if (!activeResult) return
        let content = ''
        let filename = `transcription-${activeResult.id.slice(0, 8)}.${format}`
        let mimeType = 'text/plain'

        if (format === 'md') {
            content = `# ${activeResult.fileName}\n\n## Summary\n${activeResult.summary?.summary}\n\n## Transcription\n\n${activeResult.transcription.text}`
            mimeType = 'text/markdown'
        } else if (format === 'txt') {
            content = `SUMMARY\n${activeResult.summary?.summary}\n\nTRANSCRIPTION\n${activeResult.transcription.text}`
        } else if (format === 'json') {
            content = JSON.stringify(activeResult, null, 2)
            mimeType = 'application/json'
        }

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    const copyToClipboard = () => {
        if (!activeResult) return
        const text = `# ${activeResult.fileName}\n\n${activeResult.summary?.summary}\n\n## Transcription\n\n${activeResult.transcription.text}`
        navigator.clipboard.writeText(text)
        toast.success('Скопировано в буфер обмена')
    }

    if (!activeResult) {
        return (
            <div className="flex-1 flex items-center justify-center text-muted-foreground h-full min-h-[400px]">
                Выберите запись или создайте новую
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">{activeResult.fileName}</h2>
                    <p className="text-muted-foreground text-sm">
                        {new Date(activeResult.createdAt).toLocaleString()} • {(activeResult.fileSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-2" />
                        Копировать
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('md')}>
                        <Download className="w-4 h-4 mr-2" />
                        Скачать
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="summary">Главное</TabsTrigger>
                    <TabsTrigger value="mindmap">Mindmap</TabsTrigger>
                    <TabsTrigger value="text">Текст</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>

                {/* SUMMARY TAB */}
                <TabsContent value="summary" className="space-y-4 pt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Analysis</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(activeResult.summary?.summary || '')
                                        toast.success('Саммери скопировано')
                                    }}
                                >
                                    <Copy className="w-3 h-3 mr-2" />
                                    Копировать
                                </Button>
                                <select
                                    className="h-8 rounded-md border border-input bg-background px-3 text-xs"
                                    value={selectedReAnalyzeTemplate}
                                    onChange={(e) => setSelectedReAnalyzeTemplate(e.target.value)}
                                >
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onReAnalyze(selectedReAnalyzeTemplate)}
                                    disabled={isProcessing}
                                >
                                    <RefreshCw className={cn("w-3 h-3 mr-2", isProcessing && "animate-spin")} />
                                    Re-Analyze
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <MarkdownDisplay content={activeResult.summary?.summary || "Нет данных"} />

                            {/* Key Points */}
                            {activeResult.summary?.keyPoints && activeResult.summary.keyPoints.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-3">Key Points</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        {activeResult.summary.keyPoints.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Action Items */}
                            {activeResult.summary?.actionItems && activeResult.summary.actionItems.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-3">Action Items</h3>
                                    <ul className="space-y-2">
                                        {activeResult.summary.actionItems.map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 bg-muted/30 p-2 rounded">
                                                <input type="checkbox" className="mt-1" />
                                                <div>
                                                    <span className="font-medium">{item.task}</span>
                                                    {item.assignee && <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{item.assignee}</span>}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MINDMAP TAB */}
                <TabsContent value="mindmap" className="pt-4 animate-in fade-in slide-in-from-bottom-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Layers className="w-5 h-5 text-primary" />
                                Визуализация
                            </CardTitle>
                            <div className="flex gap-2">
                                {isEditingMindmap ? (
                                    <>
                                        <Button size="sm" variant="ghost" onClick={() => setIsEditingMindmap(false)}>
                                            <X className="w-4 h-4 mr-2" /> Отмена
                                        </Button>
                                        <Button size="sm" onClick={handleSaveMindmap}>
                                            <Check className="w-4 h-4 mr-2" /> Сохранить
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => setIsEditingMindmap(true)}>
                                        <Edit className="w-4 h-4 mr-2" /> Редактировать
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="min-h-[500px]">
                            {activeResult.summary?.mindmap ? (
                                isEditingMindmap ? (
                                    <Textarea
                                        value={mindmapContent}
                                        onChange={(e) => setMindmapContent(e.target.value)}
                                        className="font-mono text-sm min-h-[500px]"
                                    />
                                ) : (
                                    <MindMap markdown={activeResult.summary.mindmap} />
                                )
                            ) : (
                                <div className="text-center p-8 text-muted-foreground">Майндмап не сгенерирован</div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TEXT TAB */}
                <TabsContent value="text" className="pt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                Полная транскрипция
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(activeResult.transcription.text)
                                        toast.success('Текст скопирован')
                                    }}
                                >
                                    <Copy className="w-3 h-3 mr-2" />
                                    Копировать
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full whitespace-pre-wrap text-base leading-relaxed p-4 bg-muted/30 rounded-md">
                                {activeResult.transcription.text}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* JSON TAB */}
                <TabsContent value="json" className="pt-4">
                    <Card>
                        <CardContent>
                            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
                                {JSON.stringify(activeResult, null, 2)}
                            </pre>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
