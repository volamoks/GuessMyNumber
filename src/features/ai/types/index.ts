export type OperationType =
    | 'generate_cjm'
    | 'generate_business_canvas'
    | 'generate_lean_canvas'
    | 'generate_roadmap'
    | 'analyze_cjm'
    | 'analyze_business_canvas'
    | 'analyze_lean_canvas'
    | 'analyze_roadmap'
    | 'improve_cjm'
    | 'improve_business_canvas'
    | 'improve_lean_canvas'
    | 'improve_roadmap'
    | 'generate_presentation'
    | 'chat_response'
    | 'analyze_transcription'

export type Language = 'ru' | 'en'

export interface PromptTemplate {
    ru: string
    en: string
}
