/**
 * Transcription Module Types
 */

export interface TranscriptionResult {
    text: string
    duration?: number
    language?: string
    segments?: TranscriptionSegment[]
}

export interface TranscriptionSegment {
    id: number
    start: number
    end: number
    text: string
}

// Enhanced summary structure for detailed analysis
export interface TranscriptionSummary {
    // Executive summary
    summary: string

    // Timeline/chronology of the meeting
    timeline?: TimelineItem[]

    // Key discussion points with details
    keyPoints: string[]

    // Important quotes from the conversation
    quotes?: string[]

    // Action items with optional assignees
    actionItems: ActionItem[]

    // Decisions made
    decisions: string[]

    // Questions that were raised
    questions?: string[]

    // Unresolved issues / open questions
    unresolvedItems?: string[]

    // Participants mentioned (if detected)
    participants?: string[]

    // Visual Mindmap (Mermaid syntax)
    mindmap?: string
}

export interface TimelineItem {
    time?: string  // Approximate time marker
    topic: string  // What was discussed
    summary: string // Brief summary
}

export interface ActionItem {
    task: string
    assignee?: string
    deadline?: string
}

export interface AudioFile {
    file: File
    name: string
    size: number
    duration?: number
    type: string
}

export type TranscriptionStatus =
    | 'idle'
    | 'uploading'
    | 'transcribing'
    | 'summarizing'
    | 'complete'
    | 'error'

export interface TranscriptionState {
    status: TranscriptionStatus
    audioFile: AudioFile | null
    transcription: TranscriptionResult | null
    summary: TranscriptionSummary | null
    error: string | null
    progress: number
}

export interface WhisperConfig {
    apiKey: string
    provider: 'groq' | 'openai'
    model?: string
    language?: string
}
