export interface AICopilotContext {
    type: 'cjm' | 'presentation' | 'roadmap' | 'business_canvas' | 'lean_canvas' | 'general'
    data?: any
    references?: ReferenceDoc[]
}

export interface ReferenceDoc {
    id: string
    name: string
    type: 'pdf' | 'text'
    content: string
    uploadDate: Date
}

export interface AICopilotState {
    isOpen: boolean
    context: AICopilotContext
    messages: ChatMessage[]
    isGenerating: boolean
}

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
}
