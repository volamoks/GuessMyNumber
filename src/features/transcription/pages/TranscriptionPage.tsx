import { useState } from 'react'
import { TranscriptionControls } from '../components/TranscriptionControls'
import { TranscriptionResults } from '../components/TranscriptionResults'
import { HistorySidebar } from '../components/HistorySidebar'
import { useTranscriptionStore } from '../store/transcriptionStore'
import { useAuthSync } from '../hooks/useAuthSync'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { useTranscriptionProcessor } from '../hooks/useTranscriptionProcessor'
import { MEETING_TEMPLATES } from '@/lib/meeting-templates'
import { AICopilotSidebar } from '@/features/ai-copilot/components/AICopilotSidebar'

export function TranscriptionPage() {
    // 1. Hooks & Stores
    useAuthSync()
    const {
        transcriptions,
        activeTranscriptionId,
        setActiveTranscription,
        deleteTranscription,
        getTranscription
    } = useTranscriptionStore()

    const recorder = useAudioRecorder()
    const processor = useTranscriptionProcessor()

    // 2. Local View State (Tabs, Templates)
    const [activeTab, setActiveTab] = useState('record')
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(MEETING_TEMPLATES[0].id)

    // 3. Derived State
    const activeResult = activeTranscriptionId ? getTranscription(activeTranscriptionId) || null : null

    // 4. Handlers
    const handleProcess = () => {
        if (!recorder.audioBlob) return
        processor.processAudio(recorder.audioBlob, selectedTemplateId)
    }

    const handleFileSelect = (file: File) => {
        const blob = new Blob([file], { type: file.type })
        recorder.setAudioBlob(blob)
        recorder.setFilesize(file.size)
        recorder.setDuration(0) // Unknown duration for uploaded files usually
        setActiveTranscription(null) // Reset view
    }

    const handleReset = () => {
        recorder.reset()
        setActiveTranscription(null)
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:max-w-[1600px]">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AI Транскрибация</h1>
                    <p className="text-muted-foreground mt-1">
                        Запись встреч, распознавание речи и умный анализ
                    </p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
                {/* LEFT COLUMN: Controls & Input */}
                <div className="flex-1 lg:max-w-xl space-y-6 overflow-y-auto pb-20">
                    <TranscriptionControls
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isRecording={recorder.isRecording}
                        duration={recorder.duration}
                        filesize={recorder.filesize}
                        audioBlob={recorder.audioBlob}
                        isProcessing={processor.isProcessing}
                        selectedTemplateId={selectedTemplateId}
                        setSelectedTemplateId={setSelectedTemplateId}
                        templates={MEETING_TEMPLATES}
                        onStartRecording={recorder.startRecording}
                        onStopRecording={recorder.stopRecording}
                        onReset={handleReset}
                        onProcess={handleProcess}
                        onFileSelect={handleFileSelect}
                    />
                </div>

                {/* MIDDLE COLUMN: Results */}
                <div className="flex-1 overflow-hidden flex flex-col min-w-0">
                    <TranscriptionResults
                        activeResult={activeResult}
                        onReAnalyze={processor.reAnalyze}
                        isProcessing={processor.isProcessing}
                        templates={MEETING_TEMPLATES}
                    />
                </div>

                {/* RIGHT COLUMN: History */}
                <HistorySidebar
                    transcriptions={transcriptions}
                    activeResultId={activeTranscriptionId || undefined}
                    onSelect={setActiveTranscription}
                    onDelete={deleteTranscription}
                />
            </div>

            <AICopilotSidebar
                contextType="transcription"
                contextData={activeResult}
            />
        </div>
    )
}
