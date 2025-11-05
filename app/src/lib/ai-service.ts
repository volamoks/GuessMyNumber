export type AIProvider = 'claude' | 'gemini' | 'openrouter' | 'openai' | 'deepseek'

interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
  baseUrl?: string
}

function getConfig(): AIConfig | null {
  if (typeof window !== 'undefined' && (window as any).__aiConfig) {
    return (window as any).__aiConfig
  }
  return null
}

export async function generateCJM(description: string, language: 'ru' | 'en' = 'ru'): Promise<any> {
  const config = getConfig()
  if (!config) throw new Error('AI не настроен')

  const prompts: Record<string, string> = {
    ru: 'Создай CJM в JSON без markdown: ' + description,
    en: 'Create CJM in JSON without markdown: ' + description
  }

  const response = await callAI(prompts[language], config)
  return parseJSON(response)
}

export async function generateBusinessCanvas(description: string): Promise<any> {
  const config = getConfig()
  if (!config) throw new Error('AI не настроен')
  const response = await callAI('Создай Business Canvas в JSON: ' + description, config)
  return parseJSON(response)
}

export async function generateLeanCanvas(description: string): Promise<any> {
  const config = getConfig()
  if (!config) throw new Error('AI не настроен')
  const response = await callAI('Создай Lean Canvas в JSON: ' + description, config)
  return parseJSON(response)
}

export async function analyzeCJM(data: any): Promise<string> {
  const config = getConfig()
  if (!config) throw new Error('AI не настроен')
  return callAI('Проанализируй CJM: ' + JSON.stringify(data), config)
}

export async function analyzeBusinessCanvas(data: any): Promise<string> {
  const config = getConfig()
  if (!config) throw new Error('AI не настроен')
  return callAI('Проанализируй Business Canvas: ' + JSON.stringify(data), config)
}

export async function analyzeLeanCanvas(data: any): Promise<string> {
  const config = getConfig()
  if (!config) throw new Error('AI не настроен')
  return callAI('Проанализируй Lean Canvas: ' + JSON.stringify(data), config)
}

async function callAI(prompt: string, config: AIConfig): Promise<string> {
  switch (config.provider) {
    case 'claude': return callClaude(prompt, config)
    case 'gemini': return callGemini(prompt, config)
    case 'openrouter': return callOpenRouter(prompt, config)
    case 'openai': return callOpenAI(prompt, config)
    case 'deepseek': return callDeepSeek(prompt, config)
    default: throw new Error('Unknown provider')
  }
}

async function callClaude(prompt: string, config: AIConfig): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!res.ok) throw new Error('Claude error: ' + res.statusText)
  const data = await res.json()
  return data.content[0].text
}

async function callGemini(prompt: string, config: AIConfig): Promise<string> {
  const model = config.model || 'gemini-pro'
  const url = 'https://generativelanguage.googleapis.com/v1/models/' + model + ':generateContent?key=' + config.apiKey
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  })
  if (!res.ok) throw new Error('Gemini error')
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

async function callOpenRouter(prompt: string, config: AIConfig): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.apiKey,
      'HTTP-Referer': window.location.origin
    },
    body: JSON.stringify({
      model: config.model || 'anthropic/claude-3.5-sonnet',
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!res.ok) throw new Error('OpenRouter error')
  const data = await res.json()
  return data.choices[0].message.content
}

async function callOpenAI(prompt: string, config: AIConfig): Promise<string> {
  const baseUrl = config.baseUrl || 'https://api.openai.com/v1'
  const res = await fetch(baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.apiKey
    },
    body: JSON.stringify({
      model: config.model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!res.ok) throw new Error('OpenAI error')
  const data = await res.json()
  return data.choices[0].message.content
}

async function callDeepSeek(prompt: string, config: AIConfig): Promise<string> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + config.apiKey
    },
    body: JSON.stringify({
      model: config.model || 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }]
    })
  })
  if (!res.ok) throw new Error('DeepSeek error')
  const data = await res.json()
  return data.choices[0].message.content
}

function parseJSON(response: string): any {
  let jsonStr = response.trim()
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '')
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '')
  }
  try {
    return JSON.parse(jsonStr)
  } catch (error) {
    throw new Error('Failed to parse AI response')
  }
}

export function isConfigured(): boolean {
  return getConfig() !== null
}

export function setAIConfig(config: AIConfig): void {
  if (typeof window !== 'undefined') {
    (window as any).__aiConfig = config
  }
}

export function clearAIConfig(): void {
  if (typeof window !== 'undefined') {
    delete (window as any).__aiConfig
  }
}
