export async function transcribeWithGroq(base64Audio: string, apiKey: string, model: string): Promise<string> {
    const url = 'https://api.groq.com/openai/v1/audio/transcriptions'

    // Convert Base64 to Blob
    const byteCharacters = atob(base64Audio)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'audio/webm' })
    const file = new File([blob], 'recording.webm', { type: 'audio/webm' })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('model', model) // e.g. distil-whisper-large-v3-en
    formData.append('response_format', 'verbose_json')
    formData.append('prompt', 'Transcribe this audio.')

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`
            // Content-Type is auto-set with boundary by fetch for FormData
        },
        body: formData
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Groq API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    // Format segments with newlines to simulating meaningful breaks/paragraphs
    if (data.segments && Array.isArray(data.segments)) {
        return data.segments.map((s: any) => s.text.trim()).join('\n\n')
    }

    return data.text || ''
}
