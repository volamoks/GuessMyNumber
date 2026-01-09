import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { generateText, generateObject } from 'ai'
import { useAIStore } from '@/store/aiStore'
import { useTranscriptionStore } from '../store/transcriptionStore'
import { MEETING_TEMPLATES } from '@/lib/meeting-templates'
import { getModel } from '@/lib/ai/vercel-ai'
import { transcribeAudioDirect } from '@/lib/ai/direct-transcribe'
import { fileToGenerativePart } from '@/lib/audio-utils'

export function useTranscriptionProcessor() {
    const [isProcessing, setIsProcessing] = useState(false)
    const { saveTranscription, setActiveTranscription, activeTranscriptionId, getTranscription, updateTranscription } = useTranscriptionStore()
    const { isAIConfigured } = useAIStore()

    const processAudio = async (audioBlob: Blob, selectedTemplateId: string) => {
        if (!audioBlob) return

        if (!useAIStore.getState().isAIConfigured('transcription')) {
            toast.error('Configured AI keys required')
            return
        }

        const model = getModel('transcription')
        if (!model) {
            toast.error("Ошибка конфигурации модели. Проверьте настройки.")
            return
        }

        setIsProcessing(true)
        try {
            const base64Audio = await fileToGenerativePart(audioBlob)
            const { configuredModels, models } = useAIStore.getState()
            const activeModelId = models.transcription
            const activeConfig = configuredModels.find(m => m.id === activeModelId)

            if (!activeConfig) throw new Error("No transcription model configured")

            console.log('[DEBUG] Phase 1 Start - Provider:', activeConfig.provider)

            // PHASE 1: TRANSCRIPTION
            const transcriptText = await transcribeAudioDirect({
                base64Audio,
                modelConfig: activeConfig
            })
            console.log('[DEBUG] Phase 1 Complete - Transcript length:', transcriptText.length)

            // PHASE 2: ANALYSIS
            const selectedTemplate = MEETING_TEMPLATES.find(t => t.id === selectedTemplateId) || MEETING_TEMPLATES[0]
            const systemPrompt = selectedTemplate.systemPrompt('General business context')
            const analysisModel = getModel('analysis')

            console.log('[DEBUG] Phase 2 Start - Analysis')
            // Using generateText manual JSON as per original implementation for wider compatibility
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
CRITICAL: DO NOT include the "transcription" field in the output JSON. The transcription is already known. Only return the analysis fields.
Do not include markdown naming like \`\`\`json.

\n\nAnalyze the following transcription:\n\n${transcriptText}`
            })

            let object: any
            try {
                let cleanJson = analysisJson.replace(/```json\n?|```/g, '').trim()
                const firstOpen = cleanJson.indexOf('{')
                const lastClose = cleanJson.lastIndexOf('}')
                if (firstOpen !== -1 && lastClose !== -1) {
                    cleanJson = cleanJson.substring(firstOpen, lastClose + 1)
                }
                object = JSON.parse(cleanJson)
            } catch (e) {
                console.error('JSON Parse Failed:', e)
                object = {
                    summary: `(⚠️ Auto-parsing failed)\n\n${analysisJson}`,
                    keyPoints: ["Check raw summary for details"],
                    actionItems: [],
                    mindmap: ""
                }
            }

            const resultData = {
                text: transcriptText,
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
                timeline: [],
                participants: [],
                questions: [],
                unresolvedItems: []
            }

            // Save and Set Active
            const id = await saveTranscription(
                `Запись ${new Date().toLocaleString()}`,
                audioBlob.size,
                resultData,
                summaryData
            )
            setActiveTranscription(id)

            toast.success('Транскрипция готова!')

        } catch (error: any) {
            console.error('Processing error:', error)
            toast.error(`Ошибка обработки: ${error.message || 'Unknown error'}`)
        } finally {
            setIsProcessing(false)
        }
    }

    const reAnalyze = async (selectedTemplateId: string) => {
        const activeResult = activeTranscriptionId ? getTranscription(activeTranscriptionId) : null
        if (!activeResult?.transcription?.text) return

        setIsProcessing(true)
        try {
            const transcriptText = activeResult.transcription.text
            const model = getModel('analysis')

            const selectedTemplate = MEETING_TEMPLATES.find(t => t.id === selectedTemplateId) || MEETING_TEMPLATES[0]
            const systemPrompt = selectedTemplate.systemPrompt('Re-analysis context')

            const schema = z.object({
                summary: z.string().describe("Comprehensive executive summary."),
                keyPoints: z.array(z.string()).describe("List of key discussion points"),
                mindmap: z.string().describe("Mermaid.js markdown code for a mindmap visualization. Start with 'mindmap'."),
                actionItems: z.array(z.object({
                    task: z.string(),
                    assignee: z.string().optional(),
                })).describe("Action items extracted from the conversation")
            })

            const { object } = await generateObject({
                model,
                schema,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Analyze the following transcription:\n\n${transcriptText}` }
                ]
            })

            const updatedSummary = {
                summary: object.summary,
                keyPoints: object.keyPoints,
                actionItems: object.actionItems,
                mindmap: object.mindmap,
                decisions: [],
                quotes: [],
                timeline: [],
                participants: [],
                questions: [],
                unresolvedItems: []
            }

            // Update in store
            await updateTranscription(activeResult.id, {
                summary: updatedSummary
            })

            toast.success('Анализ обновлен!')

        } catch (error: any) {
            console.error('Re-analysis error:', error)
            toast.error(`Ошибка анализа: ${error.message}`)
        } finally {
            setIsProcessing(false)
        }
    }

    return {
        isProcessing,
        processAudio,
        reAnalyze
    }
}
