export async function transcribeWithLocal(base64Audio: string, baseUrl: string, model: string, apiKey?: string): Promise<string> {
    const isWhisper = model.toLowerCase().includes('whisper')

    // Detect if we should use the Audio Transcription API (Multipart) or Chat Completions (Multimodal)
    const endpoint = isWhisper ? '/audio/transcriptions' : '/chat/completions'
    // Normalize URL: remove trailing slash from baseUrl if present
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '')
    // Construct full URL. Note: Some users might provide full path in baseUrl, but usually it's just the root v1.
    // If the user provided a full path ending in v1, we append correctly.
    const url = `${cleanBaseUrl}${endpoint}`

    const headers: Record<string, string> = {}
    if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
    }

    if (isWhisper) {
        // --- Audio Transcription API (Multipart) ---
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
        formData.append('model', model)
        formData.append('response_format', 'verbose_json')

        const response = await fetch(url, {
            method: 'POST',
            headers, // Content-Type is auto-set
            body: formData
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Local API Error (${endpoint}): ${response.status} - ${error}`)
        }

        const data = await response.json()

        // Format segments with newlines to simulating meaningful breaks/paragraphs
        if (data.segments && Array.isArray(data.segments)) {
            return data.segments.map((s: any) => s.text.trim()).join('\n\n')
        }

        return data.text || ''

    } else {
        // --- Chat Completions API (Multimodal Hack) ---
        headers['Content-Type'] = 'application/json'

        const payload = {
            model,
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: "Transcribe this audio. Return only the transcript." },
                    { type: 'image_url', image_url: { url: `data:audio/webm;base64,${base64Audio}` } }
                ]
            }],
            max_tokens: 4096
        }

        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            const error = await response.text()
            throw new Error(`Local API Error (${endpoint}): ${response.status} - ${error}`)
        }

        const data = await response.json()
        return data.choices?.[0]?.message?.content || ''
    }
}
