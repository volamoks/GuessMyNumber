export async function transcribeWithOpenAI(base64Audio: string, apiKey: string, model: string): Promise<string> {
    const url = 'https://api.openai.com/v1/chat/completions'

    // OpenAI audio support (for gpt-4o-audio-preview, etc.)
    const payload = {
        model,
        messages: [{
            role: 'user',
            content: [
                { type: 'text', text: "Transcribe this audio. Identify speakers as 'Speaker 1', 'Speaker 2', etc. Return only the transcript." },
                { type: 'input_audio', input_audio: { data: base64Audio, format: 'webm' } }
            ]
        }],
        max_tokens: 8192
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenAI API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
}
