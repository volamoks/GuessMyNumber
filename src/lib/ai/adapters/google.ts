export async function transcribeWithGoogle(base64Audio: string, apiKey: string, model: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const payload = {
        contents: [{
            parts: [
                { inline_data: { mime_type: "audio/webm", data: base64Audio } },
                { text: "Transcribe this audio. Identify speakers as 'Speaker 1', 'Speaker 2', etc. Return only the transcript." }
            ]
        }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Google API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}
