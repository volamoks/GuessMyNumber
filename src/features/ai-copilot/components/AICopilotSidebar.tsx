import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Bot, Send, FileText, X, Sparkles, Loader2, Copy } from 'lucide-react'
import { PDFUploader } from './PDFUploader'
import { useAIStore } from '@/store/aiStore'
import { aiService } from '@/lib/ai-service-new'
import type { ReferenceDoc, ChatMessage } from '../types'
import { MARKDOWN_CHEATSHEET } from '@/features/presentation/utils/markdown-rules'
import { toast } from 'sonner'

interface AICopilotSidebarProps {
    contextType: 'cjm' | 'presentation' | 'roadmap' | 'business_canvas' | 'lean_canvas' | 'general' | 'transcription'
    contextData?: any
}

export function AICopilotSidebar({ contextType, contextData }: AICopilotSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [input, setInput] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [references, setReferences] = useState<ReferenceDoc[]>([])

    const { isAIConfigured } = useAIStore()
    const hasKey = isAIConfigured('chat')

    const handleReferenceUpload = (text: string, fileName: string) => {
        const newRef: ReferenceDoc = {
            id: Math.random().toString(36).substring(7),
            name: fileName,
            type: 'pdf',
            content: text,
            uploadDate: new Date()
        }
        setReferences(prev => [...prev, newRef])
    }

    const removeReference = (id: string) => {
        setReferences(prev => prev.filter(r => r.id !== id))
    }

    const handleSend = async () => {
        if (!input.trim()) return

        if (!hasKey) {
            toast.error('AI is not configured. Please set API Key in Settings.')
            return
        }

        const userMessage: ChatMessage = {
            id: Math.random().toString(36).substring(7),
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsGenerating(true)

        try {
            // Construct prompt with context and references
            let prompt = `Context: ${contextType}\n`

            if (contextData) {
                if (contextType === 'transcription') {
                    // optimized format for transcription
                    const t = contextData
                    prompt += `Meeting Title: ${t.fileName}\n`
                    prompt += `Summary: ${t.summary?.summary || 'No summary'}\n`
                    prompt += `Key Points: ${t.summary?.keyPoints?.join('; ') || 'None'}\n`
                    // Limit text to avoid token limits (approx 50k chars)
                    const text = t.transcription?.text || ''
                    prompt += `Transcription Text:\n${text.substring(0, 50000)}\n\n`
                } else {
                    prompt += `Current Data: ${JSON.stringify(contextData, null, 2)}\n\n`
                }
            }

            if (references.length > 0) {
                prompt += `References:\n`
                references.forEach(ref => {
                    prompt += `--- ${ref.name} ---\n${ref.content.substring(0, 5000)}...\n\n` // Truncate for now
                })
            }

            prompt += `User Request: ${userMessage.content}`

            const response = await aiService.generate<string>(
                'chat_response', // We might need to add this operation type
                prompt,
                'ru', // Default to RU for now, make configurable later
                undefined,
                () => prompt, // Pass raw prompt
                true // skipJsonParse
            )

            const botMessage: ChatMessage = {
                id: Math.random().toString(36).substring(7),
                role: 'assistant',
                content: typeof response === 'string' ? response : JSON.stringify(response),
                timestamp: new Date()
            }

            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            console.error('AI Error:', error)
            toast.error('Failed to get response from AI')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    <Bot className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            AI Copilot
                        </SheetTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                navigator.clipboard.writeText(MARKDOWN_CHEATSHEET)
                                toast.success('Guide copied to clipboard!')
                            }}
                            title="Copy Presentation Guide"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <div className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Hello! I can help you with your {contextType}.</p>
                                    <p className="text-sm mt-2">Upload a PDF reference or ask me anything.</p>
                                </div>
                            )}

                            {messages.map(msg => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}

                            {isGenerating && (
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-lg p-3">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* References Area */}
                    {references.length > 0 && (
                        <div className="p-2 border-t bg-muted/30 flex gap-2 overflow-x-auto">
                            {references.map(ref => (
                                <div key={ref.id} className="flex items-center gap-1 bg-background border rounded px-2 py-1 text-xs">
                                    <FileText className="h-3 w-3" />
                                    <span className="max-w-[100px] truncate">{ref.name}</span>
                                    <button onClick={() => removeReference(ref.id)} className="hover:text-destructive">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="p-4 border-t space-y-4">
                        <PDFUploader onUpload={handleReferenceUpload} disabled={isGenerating} />

                        <div className="flex gap-2">
                            <Textarea
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Ask AI to improve content..."
                                className="min-h-[80px]"
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSend()
                                    }
                                }}
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isGenerating}
                                className="h-auto"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
