
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MindMap } from '@/components/MindMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic, StopCircle, Upload, FileAudio, RefreshCw, Layers, FileText, Download, RotateCcw, Trash2, ChevronDown } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { MEETING_TEMPLATES } from '@/lib/meeting-templates'
import { useAIStore } from '@/store/aiStore'
import { getModel } from '@/lib/ai/vercel-ai'
import { generateObject, generateText } from 'ai'
import { z } from 'zod'
import { fileToGenerativePart, formatDuration } from '@/lib/audio-utils'
import { transcribeAudioDirect } from '@/lib/ai/direct-transcribe'
import { toast } from 'sonner'
import { useTranscriptionStore, type SavedTranscription } from '../store/transcriptionStore'
import { useAuth } from '@/features/auth/AuthContext'
import { cn } from '@/lib/utils'
import { useAIPromptsStore } from '@/store'
import ReactMarkdown from 'react-markdown'
import { Settings, Sparkles } from 'lucide-react'

import { Textarea } from '@/components/ui/textarea'
import { Edit, Check, X, PanelRightClose, PanelRightOpen } from 'lucide-react'

// --- Components ---



const AudioVisualizer = ({ isRecording }: { isRecording: boolean }) => {
    return (
        <div className="h-12 flex items-center justify-center gap-1">
            {isRecording ? (
                Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-1 bg-primary/60 rounded-full animate-pulse"
                        style={{
                            height: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.05}s`,
                            animationDuration: '0.5s'
                        }}
                    />
                ))
            ) : (
                <div className="text-muted-foreground text-sm">Микрофон выключен</div>
            )}
        </div>
    )
}

// --- Main Page ---

export function TranscriptionPage() {
    const { isAIConfigured } = useAIStore()
    const { saveTranscription, transcriptions, deleteTranscription, setUserId, fetchUserTranscriptions, migrateLocalData } = useTranscriptionStore()
    const { user } = useAuth()
    const { getPrompt } = useAIPromptsStore()

    // State
    const [activeTab, setActiveTab] = useState('record')
    const [isRecording, setIsRecording] = useState(false)
    const [duration, setDuration] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [filesize, setFilesize] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(MEETING_TEMPLATES[0].id)
    const [activeResult, setActiveResult] = useState<SavedTranscription | null>(null)

    // Mindmap Editing State
    const [isEditingMindmap, setIsEditingMindmap] = useState(false)
    const [mindmapContent, setMindmapContent] = useState('')
    const [showHistory, setShowHistory] = useState(true)

    // Sync state when activeResult changes

    // Sync state when activeResult changes
    useEffect(() => {
        if (activeResult?.summary?.mindmap) {
            setMindmapContent(activeResult.summary.mindmap)
        } else {
            setMindmapContent('')
        }
        setIsEditingMindmap(false)
        setIsEditingMindmap(false)
    }, [activeResult])

    // Sync Auth with Store and Migrate
    useEffect(() => {
        if (user) {
            setUserId(user.id)
            // Check if we have local items to migrate
            const hasLocalItems = transcriptions.some(t => t.id.startsWith('trans_'))

            if (hasLocalItems) {
                toast.promise(migrateLocalData(), {
                    loading: 'Перенос локальной истории в облако...',
                    success: 'История успешно синхронизирована!',
                    error: 'Ошибка при переносе истории'
                })
            } else {
                fetchUserTranscriptions()
            }
        } else {
            setUserId(null)
        }
    }, [user, setUserId, fetchUserTranscriptions, migrateLocalData])

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const chunksRef = useRef<BlobPart[]>([])
    const activeResultRef = useRef<HTMLDivElement>(null)

    const hasKeys = isAIConfigured('transcription')

    // Scroll to result when it appears
    useEffect(() => {
        if (activeResult) {
            setTimeout(() => {
                activeResultRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        }
    }, [activeResult])

    // Start Recording
    const startRecording = async () => {
        if (!hasKeys) {
            toast.error('Пожалуйста, добавьте API ключи в настройках')
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
            mediaRecorderRef.current = mediaRecorder
            chunksRef.current = []

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data)
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
                setAudioBlob(blob)
                setFilesize(blob.size)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start(100) // Collect chunks every 100ms
            setIsRecording(true)
            setAudioBlob(null)
            setActiveResult(null)

            // Timer
            const startTime = Date.now()
            setDuration(0)
            timerRef.current = setInterval(() => {
                setDuration(Math.floor((Date.now() - startTime) / 1000))
            }, 1000)

        } catch (err) {
            console.error('Error accessing microphone:', err)
            toast.error('Ошибка доступа к микрофону. Проверьте разрешения.')
        }
    }

    // Stop Recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }

    // Reset
    const reset = () => {
        setAudioBlob(null)
        setDuration(0)
        setActiveResult(null)
        setFilesize(0)
    }

    // Handle Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 25 * 1024 * 1024) {
            toast.error('Файл слишком большой (>25MB)')
            return
        }

        const blob = new Blob([file], { type: file.type })
        setAudioBlob(blob)
        setFilesize(file.size)
        // Dummy duration for uploaded files
        setDuration(0)
        setActiveResult(null)
    }

    // --- ACTIONS ---



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

    // Process Audio (Two-Phase: Transcribe -> Analyze)
    const processAudio = async () => {
        if (!audioBlob) return

        if (!hasKeys) {
            toast.error('Configured AI keys required')
            return
        }

        const model = getModel('transcription')
        // Check if model is properly configured
        try {
            // simple check if model object is valid
            if (!model) throw new Error("Model not configured")
        } catch (e) {
            toast.error("Ошибка конфигурации модели. Проверьте настройки.")
            return
        }

        setIsProcessing(true)
        try {
            const base64Audio = await fileToGenerativePart(audioBlob)

            // Get Model Config
            const { configuredModels, models } = useAIStore.getState()
            const activeModelId = models.transcription
            const activeConfig = configuredModels.find(m => m.id === activeModelId)


            if (!activeConfig) throw new Error("No transcription model configured")

            console.log('[DEBUG] Phase 1 Start - Provider:', activeConfig.provider)

            // PHASE 1: TRANSCRIPTION (Audio -> Text) via Direct REST API
            const transcriptText = await transcribeAudioDirect({
                base64Audio,
                modelConfig: activeConfig
            })
            console.log('[DEBUG] Phase 1 Complete - Transcript length:', transcriptText.length)

            // 2. Analyze with AI
            // Get template prompt
            const selectedTemplate = MEETING_TEMPLATES.find(t => t.id === selectedTemplateId) || MEETING_TEMPLATES[0]
            const systemPrompt = selectedTemplate.systemPrompt('General business context')

            console.log('[DEBUG] Phase 2 Start - Analysis')
            // PHASE 2: ANALYSIS (Text -> Structured Data)
            // Use 'analysis' model for this phase (clean text processing)
            const analysisModel = getModel('analysis')

            console.log('[DEBUG] Calling generateText (Manual JSON Mode)')

            // We use generateText instead of generateObject because DeepSeek/OpenRouter don't fully support 'json_object' mode via SDK
            const { text: analysisJson } = await generateText({
                model: analysisModel,
                prompt: `${systemPrompt}

You MUST return the result as a valid JSON object matching this structure:
{
  "summary": "Full Markdown report with # Title, **Metadata**, and detailed sections.",
  "keyPoints": ["Detailed point 1 with context", "Detailed point 2 with context"],
  "mindmap": "Markdown-formatted text (headings #, lists -) for visual map",
  "actionItems": [{"task": "Specific actionable task", "assignee": "Name"}]
}

Important: Return ONLY valid JSON. 
CRITICAL: DO NOT include the "transcription" field in the output JSON. The transcription is already known. Only return the analysis fields (summary, keyPoints, etc).
Do not include markdown naming like \`\`\`json.

\n\nAnalyze the following transcription:\n\n${transcriptText}`
            })

            let object: any
            try {
                // Clean up potential markdown code blocks
                let cleanJson = analysisJson.replace(/```json\n?|```/g, '').trim()
                // Find first '{' and last '}' to handle introductory text
                const firstOpen = cleanJson.indexOf('{')
                const lastClose = cleanJson.lastIndexOf('}')
                if (firstOpen !== -1 && lastClose !== -1) {
                    cleanJson = cleanJson.substring(firstOpen, lastClose + 1)
                }
                object = JSON.parse(cleanJson)
            } catch (e) {
                console.error('JSON Parse Failed:', e)
                console.log('Raw Output:', analysisJson)
                // Fallback: Use raw text as summary so user sees something
                object = {
                    transcription: transcriptText,
                    summary: `(⚠️ Auto-parsing failed)\n\n${analysisJson}`,
                    keyPoints: ["Check raw summary for details"],
                    actionItems: []
                }
            }

            // Map results
            const resultData = {
                text: transcriptText, // Use original full text
                summary: object.summary || "No summary generated",
                keyPoints: object.keyPoints || [],
                mindmap: object.mindmap || "",
                actionItems: object.actionItems || [],
            }

            const summaryData = {
                summary: object.summary,
                keyPoints: object.keyPoints,
                actionItems: object.actionItems,
                mindmap: object.mindmap,
                decisions: [],
                quotes: [],
                timeline: []
            }

            // Save to store
            const id = await saveTranscription(
                `Запись ${new Date().toLocaleString()}`,
                filesize,
                resultData,
                summaryData
            )

            // Force update active result to show immediately
            setActiveResult({
                id,
                fileName: `Запись ${new Date().toLocaleString()}`,
                fileSize: filesize,
                createdAt: new Date().toISOString(),
                transcription: resultData,
                summary: summaryData
            })

            toast.success('Транскрипция готова!')

        } catch (error: any) {
            console.error('Processing error:', error)
            toast.error(`Ошибка обработки: ${error.message || 'Unknown error'}`)
        } finally {
            setIsProcessing(false)
        }
    }

    // Re-Analyze (Phase 2: Text -> Analysis)
    const handleReAnalyze = async () => {
        if (!activeResult?.transcription?.text) return

        setIsProcessing(true)
        try {
            const transcriptText = activeResult.transcription.text
            const model = getModel('analysis') // Use 'analysis' model for this phase, as it's pure text

            // Schema (same as before)
            const schema = z.object({
                summary: z.string().describe("Comprehensive executive summary."),
                keyPoints: z.array(z.string()).describe("List of key discussion points"),
                mindmap: z.string().describe("Mermaid.js markdown code for a mindmap visualization. Start with 'mindmap'."),
                actionItems: z.array(z.object({
                    task: z.string(),
                    assignee: z.string().optional(),
                })).describe("Action items extracted from the conversation")
            })

            // Custom Prompt
            // Custom Prompt
            // Get template prompt
            const selectedTemplate = MEETING_TEMPLATES.find(t => t.id === selectedTemplateId) || MEETING_TEMPLATES[0]
            const systemPrompt = selectedTemplate.systemPrompt('Re-analysis context')

            const { object } = await generateObject({
                model,
                schema,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: `Analyze the following transcription:\n\n${transcriptText}`
                    }
                ]
            })

            // Update result
            const updatedSummary = {
                summary: object.summary,
                keyPoints: object.keyPoints,
                actionItems: object.actionItems,
                mindmap: object.mindmap,
                decisions: [],
                quotes: [],
                timeline: []
            }

            // Update logic
            const updatedResult = {
                ...activeResult,
                summary: updatedSummary
            }

            // Update in store
            const { updateTranscription } = useTranscriptionStore.getState()
            updateTranscription(activeResult.id, { summary: updatedSummary })

            // Update local state
            setActiveResult(updatedResult)

            toast.success('Анализ обновлен!')

        } catch (error: any) {
            console.error('Re-analysis error:', error)
            toast.error(`Ошибка переанализа: ${error.message}`)
        } finally {
            setIsProcessing(false)
        }
    }

    // Load history item
    const loadHistory = (item: SavedTranscription) => {
        setActiveResult(item)
        setAudioBlob(null) // Clear current recording if any
    }

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-100px)]">
            {/* LEFT COLUMN: Controls & Input */}
            <div className="flex-1 space-y-6 overflow-y-auto pb-20">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent inline-flex items-center gap-2">
                            <Mic className="text-primary" />
                            AI Транскрипция
                        </h1>
                        <p className="text-muted-foreground">
                            Запишите аудио или загрузите файл для получения транскрипции, резюме и майндмапа.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowHistory(!showHistory)}
                        title={showHistory ? "Скрыть историю" : "Показать историю"}
                    >
                        {showHistory ? <PanelRightClose className="h-5 w-5" /> : <PanelRightOpen className="h-5 w-5" />}
                    </Button>
                </div>

                {!activeResult && (
                    <Card className="border-2 border-dashed shadow-sm">
                        <CardHeader>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="record">Запись</TabsTrigger>
                                    <TabsTrigger value="upload">Загрузка</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center min-h-[300px] gap-6">

                            {activeTab === 'record' ? (
                                <>
                                    <div className={cn(
                                        "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300",
                                        isRecording ? "bg-red-100 text-red-600 animate-pulse" : "bg-primary/10 text-primary"
                                    )}>
                                        <Mic className="w-12 h-12" />
                                    </div>

                                    <div className="text-4xl font-mono font-medium tabular-nums">
                                        {formatDuration(duration)}
                                    </div>

                                    <AudioVisualizer isRecording={isRecording} />

                                    {audioBlob && !isRecording && (
                                        <audio
                                            controls
                                            src={URL.createObjectURL(audioBlob)}
                                            className="w-full mt-4 max-w-md"
                                        />
                                    )}

                                    <div className="flex gap-4">
                                        {!isRecording ? (
                                            <Button size="lg" className="h-12 px-8 rounded-full" onClick={startRecording}>
                                                Начать запись
                                            </Button>
                                        ) : (
                                            <Button size="lg" variant="destructive" className="h-12 px-8 rounded-full" onClick={stopRecording}>
                                                <StopCircle className="mr-2 h-5 w-5" />
                                                Стоп
                                            </Button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
                                        <Upload className="w-12 h-12 text-muted-foreground" />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="font-medium text-lg">Загрузите аудиофайл</h3>
                                        <p className="text-sm text-muted-foreground">MP3, WAV, M4A, WebM (max 25MB)</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        id="audio-upload"
                                        onChange={handleFileUpload}
                                    />
                                    <Button size="lg" variant="outline" onClick={() => document.getElementById('audio-upload')?.click()}>
                                        Выбрать файл
                                    </Button>
                                </>
                            )}

                        </CardContent>
                    </Card>
                )}

                {/* Processing State */}
                {/* Ready to Process (Audio Blob exists) */}
                {audioBlob && !isProcessing && !activeResult && (
                    <Card className="animate-in fade-in slide-in-from-bottom-4">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600">
                                    <FileAudio className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-medium">Аудио готово к обработке</h3>
                                    <p className="text-sm text-muted-foreground">{filesize > 0 && `${(filesize / 1024 / 1024).toFixed(2)} MB`}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" onClick={reset}>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Сброс
                                </Button>
                                <Button onClick={processAudio}>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Обработать AI
                                </Button>
                            </div>
                        </CardContent>

                        {/* Processing Options (Phase 1 Control) */}
                        <div className="px-6 pb-4 flex items-center justify-between text-xs text-muted-foreground w-full">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Settings className="h-3 w-3" />
                                    <span>Model: {useAIStore.getState().configuredModels.find(m => m.id === useAIStore.getState().models.transcription)?.name || 'Default'}</span>
                                </div>
                            </div>

                            {/* Template Selector Phase 1 */}
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Template:</span>
                                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                    <SelectTrigger className="h-7 w-[180px] text-xs">
                                        <SelectValue placeholder="Select template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MEETING_TEMPLATES.map(t => (
                                            <SelectItem key={t.id} value={t.id} className="text-xs">
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Processing Spinner */}
                {isProcessing && (
                    <Card className="border-primary/50">
                        <CardContent className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <div>
                                <h3 className="text-lg font-medium">AI анализирует запись...</h3>
                                <p className="text-muted-foreground">Это может занять от 10 до 60 секунд</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* RESULTS VIEW */}
                {activeResult && (
                    <div ref={activeResultRef} className="space-y-6 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setActiveResult(null)}>
                                    ← Новая запись
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    {new Date(activeResult.createdAt).toLocaleString()}
                                </span>
                            </div>

                            {/* Re-Analyze Controls (Phase 2) */}
                            <div className="flex items-center gap-2">
                                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                    <SelectTrigger className="h-8 w-[160px] text-xs">
                                        <SelectValue placeholder="Change Template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MEETING_TEMPLATES.map(t => (
                                            <SelectItem key={t.id} value={t.id} className="text-xs">
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button variant="secondary" size="sm" onClick={handleReAnalyze} disabled={isProcessing}>
                                    {isProcessing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                    Re-Analyze
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                            <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleExport('md')}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Markdown (.md)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('txt')}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            Plain Text (.txt)
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleExport('json')}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            JSON (.json)
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <Tabs defaultValue="summary" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="summary">Главное</TabsTrigger>
                                <TabsTrigger value="mindmap">Mindmap</TabsTrigger>
                                <TabsTrigger value="text">Текст</TabsTrigger>
                            </TabsList>

                            {/* TAB: SUMMARY */}
                            <TabsContent value="summary" className="space-y-4 pt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-blue-500" />
                                            Резюме
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-4 leading-relaxed prose dark:prose-invert !max-w-none">
                                            <ReactMarkdown>
                                                {activeResult.summary?.summary || "Нет данных"}
                                            </ReactMarkdown>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                                Ключевые моменты
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2 list-disc pl-4 marker:text-primary">
                                                {activeResult.summary?.keyPoints.map((point: string, i: number) => (
                                                    <li key={i}>{point}</li>
                                                )) || <li className="text-muted-foreground">Пусто</li>}
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                                                Задачи (Action Items)
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {activeResult.summary?.actionItems.map((item: any, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 bg-muted/50 p-2 rounded text-sm">
                                                        <input type="checkbox" className="mt-1" />
                                                        <div>
                                                            <div className="font-medium">{item.task}</div>
                                                            {item.assignee && <div className="text-xs text-muted-foreground">@{item.assignee}</div>}
                                                        </div>
                                                    </li>
                                                )) || <li className="text-muted-foreground">Нет задач</li>}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            {/* TAB: MINDMAP */}
                            <TabsContent value="mindmap" className="pt-4 animate-in fade-in slide-in-from-bottom-2">
                                <Card className="h-[600px] flex flex-col">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3 px-4 border-b">
                                        <CardTitle className="text-base font-medium flex items-center gap-2">
                                            Визуализация
                                        </CardTitle>
                                        <div className="flex items-center gap-2">
                                            {isEditingMindmap ? (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => setIsEditingMindmap(false)}>
                                                        <X className="h-4 w-4 mr-1" />
                                                        Отмена
                                                    </Button>
                                                    <Button size="sm" onClick={() => {
                                                        // Save changes
                                                        setIsEditingMindmap(false)
                                                        if (activeResult) {
                                                            const updated = {
                                                                ...activeResult,
                                                                summary: {
                                                                    summary: "",
                                                                    keyPoints: [],
                                                                    actionItems: [],
                                                                    decisions: [],
                                                                    quotes: [],
                                                                    timeline: [],
                                                                    questions: [],
                                                                    unresolvedItems: [],
                                                                    participants: [],
                                                                    ...activeResult.summary,
                                                                    mindmap: mindmapContent
                                                                }
                                                            }
                                                            setActiveResult(updated)
                                                            useTranscriptionStore.getState().updateTranscription(activeResult.id, {
                                                                summary: updated.summary
                                                            })
                                                            toast.success('Mindmap сохранен')
                                                        }
                                                    }}>
                                                        <Check className="h-4 w-4 mr-1" />
                                                        Сохранить
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button variant="outline" size="sm" onClick={() => setIsEditingMindmap(true)}>
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Редактировать
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <div className="flex-1 min-h-0 relative">
                                        {isEditingMindmap ? (
                                            <div className="absolute inset-0 p-4">
                                                <Textarea
                                                    value={mindmapContent}
                                                    onChange={(e) => setMindmapContent(e.target.value)}
                                                    className="w-full h-full font-mono text-sm resize-none"
                                                    placeholder="# Root&#10;## Branch 1&#10;- Item 1"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full">
                                                {mindmapContent ? (
                                                    <MindMap markdown={mindmapContent} className="w-full h-full border-0 rounded-none shadow-none" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-muted-foreground">
                                                        Нет данных для карты
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>

                            {/* TAB: TEXT */}
                            <TabsContent value="text" className="pt-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-base font-medium">
                                            Полная расшифровка
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                                                <Layers className="h-4 w-4 mr-2" />
                                                Копировать
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed p-4 bg-muted/30 rounded-lg whitespace-pre-wrap">
                                            {activeResult.transcription.text}
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: History */}
            {showHistory && (
                <div className="w-full lg:w-80 shrink-0 border-l pl-0 lg:pl-6 pt-6 lg:pt-0 animate-in slide-in-from-right-10 duration-300">
                    <div className="sticky top-6 space-y-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            История записей
                        </h2>

                        <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                            {transcriptions.length === 0 ? (
                                <div className="text-sm text-muted-foreground text-center py-8">
                                    Нет сохраненных записей
                                </div>
                            ) : (
                                transcriptions.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => loadHistory(item)}
                                        className={cn(
                                            "p-3 rounded-lg border text-sm cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/50 group relative",
                                            activeResult?.id === item.id ? "border-primary bg-primary/5 shadow-sm" : "bg-card"
                                        )}
                                    >
                                        <div className="font-medium truncate pr-6">{item.fileName}</div>
                                        <div className="text-xs text-muted-foreground flex justify-between mt-1">
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                            <span>{useTranscriptionStore.getState().getTranscription(item.id)?.fileSize ? (useTranscriptionStore.getState().getTranscription(item.id)!.fileSize / 1024 / 1024).toFixed(1) + ' MB' : ''}</span>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (confirm('Удалить?')) {
                                                    deleteTranscription(item.id)
                                                    if (activeResult?.id === item.id) setActiveResult(null)
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
