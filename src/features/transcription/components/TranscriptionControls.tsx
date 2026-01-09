import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Mic, StopCircle, Upload, FileAudio, RefreshCw, Sparkles, Trash2, Info } from 'lucide-react'
import { AudioVisualizer } from '@/components/ui/AudioVisualizer'
import { formatDuration } from '@/lib/audio-utils'
import { useAIStore } from '@/store/aiStore'

interface TranscriptionControlsProps {
    activeTab: string
    setActiveTab: (val: string) => void
    isRecording: boolean
    duration: number
    filesize: number
    audioBlob: Blob | null
    isProcessing: boolean
    selectedTemplateId: string
    setSelectedTemplateId: (id: string) => void
    templates: any[]
    onStartRecording: () => void
    onStopRecording: () => void
    onReset: () => void
    onProcess: () => void
    onFileSelect: (file: File) => void
}

export function TranscriptionControls({
    activeTab,
    setActiveTab,
    isRecording,
    duration,
    filesize,
    audioBlob,
    isProcessing,
    selectedTemplateId,
    setSelectedTemplateId,
    templates,
    onStartRecording,
    onStopRecording,
    onReset,
    onProcess,
    onFileSelect
}: TranscriptionControlsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { isAIConfigured } = useAIStore()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) onFileSelect(file)
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Запись и Настройки</span>
                    {!isAIConfigured('transcription') && (
                        <div className="flex items-center text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                            <Info className="w-3 h-3 mr-1" />
                            Настройте AI
                        </div>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 flex-1 overflow-y-auto">
                {/* TABS: Record vs Upload */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="record">
                            <Mic className="w-4 h-4 mr-2" />
                            Диктофон
                        </TabsTrigger>
                        <TabsTrigger value="upload">
                            <Upload className="w-4 h-4 mr-2" />
                            Загрузка
                        </TabsTrigger>
                    </TabsList>

                    {/* RECORD TAB */}
                    <TabsContent value="record" className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/30 relative overflow-hidden transition-all duration-300">
                            {isRecording && (
                                <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                            )}

                            <div className="mb-6 scale-125">
                                <AudioVisualizer isRecording={isRecording} />
                            </div>

                            <div className="text-4xl font-mono font-bold tracking-wider mb-8 tabular-nums">
                                {formatDuration(duration)}
                            </div>

                            <div className="flex gap-4 z-10">
                                {!isRecording ? (
                                    <Button
                                        size="lg"
                                        onClick={onStartRecording}
                                        className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg hover:scale-105 transition-all"
                                    >
                                        <Mic className="w-6 h-6 text-white" />
                                    </Button>
                                ) : (
                                    <Button
                                        size="lg"
                                        variant="destructive"
                                        onClick={onStopRecording}
                                        className="h-14 w-14 rounded-full shadow-lg hover:scale-105 transition-all animate-pulse"
                                    >
                                        <StopCircle className="w-6 h-6" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* UPLOAD TAB */}
                    <TabsContent value="upload" className="space-y-4">
                        <div
                            className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 h-[240px]"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                                <FileAudio className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-semibold">Нажмите для выбора файла</h3>
                            <p className="text-sm text-muted-foreground">
                                MP3, WAV, M4A, OGG (до 25MB)
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* FILE INFO & ACTIONS */}
                {audioBlob && (
                    <div className="bg-card border rounded-lg p-4 space-y-4 animate-in fade-in slide-in-from-top-2 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <CheckIcon />
                                </div>
                                <div>
                                    <p className="font-medium">Аудио готово</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(filesize / 1024 / 1024).toFixed(2)} MB • {formatDuration(duration)}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onReset} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* TEMPLATE SELECTOR */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Шаблон анализа</label>
                            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {templates.map(t => (
                                        <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all h-12 text-base"
                            onClick={onProcess}
                            disabled={isProcessing || !isAIConfigured('transcription')}
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                    Обработка...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Анализировать
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function CheckIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="20 6 9 17 4 12" /></svg>
    )
}
