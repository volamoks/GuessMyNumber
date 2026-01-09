export async function transcribeWithOpenRouter(base64Audio: string, apiKey: string, model: string): Promise<string> {
    const url = 'https://openrouter.ai/api/v1/chat/completions'

    // OpenRouter uses OpenAI-compatible format
    const payload = {
        model,
        messages: [{
            role: 'user',
            content: [
                { type: 'text', text: "Transcribe this audio. Identify speakers as 'Speaker 1', 'Speaker 2', etc. Return only the transcript." },
                { type: 'image_url', image_url: { url: `data:audio/webm;base64,${base64Audio}` } }
            ]
        }],
        max_tokens: 8192
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Product Tools'
        },
        body: JSON.stringify(payload)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`OpenRouter API Error: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
}
