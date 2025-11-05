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

export async function generateBusinessCanvas(description: string, language: 'ru' | 'en' = 'ru'): Promise<any> {
  const config = getConfig()
  if (!config) throw new Error('AI не настроен')

  const prompts: Record<string, string> = {
    ru: `Создай Business Model Canvas в JSON формате для: ${description}

Структура JSON:
{
  "title": "название продукта/услуги",
  "keyPartners": ["партнер 1", "партнер 2", ...],
  "keyActivities": ["активность 1", "активность 2", ...],
  "keyResources": ["ресурс 1", "ресурс 2", ...],
  "valueProposition": ["ценность 1", "ценность 2", ...],
  "customerRelationships": ["взаимоотношение 1", "взаимоотношение 2", ...],
  "channels": ["канал 1", "канал 2", ...],
  "customerSegments": ["сегмент 1", "сегмент 2", ...],
  "costStructure": ["статья расходов 1", "статья расходов 2", ...],
  "revenueStreams": ["источник дохода 1", "источник дохода 2", ...]
}

Верни только JSON без markdown блоков.`,
    en: `Create a Business Model Canvas in JSON format for: ${description}

JSON structure:
{
  "title": "product/service name",
  "keyPartners": ["partner 1", "partner 2", ...],
  "keyActivities": ["activity 1", "activity 2", ...],
  "keyResources": ["resource 1", "resource 2", ...],
  "valueProposition": ["value 1", "value 2", ...],
  "customerRelationships": ["relationship 1", "relationship 2", ...],
  "channels": ["channel 1", "channel 2", ...],
  "customerSegments": ["segment 1", "segment 2", ...],
  "costStructure": ["cost 1", "cost 2", ...],
  "revenueStreams": ["revenue stream 1", "revenue stream 2", ...]
}

Return only JSON without markdown blocks.`
  }

  const response = await callAI(prompts[language], config)
  return parseJSON(response)
}

export async function generateLeanCanvas(description: string, language: 'ru' | 'en' = 'ru'): Promise<any> {
  const config = getConfig()
  if (!config) throw new Error('AI не настроен')

  const prompts: Record<string, string> = {
    ru: `Создай Lean Canvas в JSON формате для: ${description}

Структура JSON:
{
  "title": "название продукта/услуги",
  "problem": ["проблема 1", "проблема 2", "проблема 3"],
  "solution": ["решение 1", "решение 2", "решение 3"],
  "keyMetrics": ["метрика 1", "метрика 2", ...],
  "uniqueValueProposition": "уникальное ценностное предложение (одна строка)",
  "unfairAdvantage": ["преимущество 1", "преимущество 2", ...],
  "channels": ["канал 1", "канал 2", ...],
  "customerSegments": ["сегмент 1", "сегмент 2", ...],
  "costStructure": ["статья расходов 1", "статья расходов 2", ...],
  "revenueStreams": ["источник дохода 1", "источник дохода 2", ...]
}

Верни только JSON без markdown блоков.`,
    en: `Create a Lean Canvas in JSON format for: ${description}

JSON structure:
{
  "title": "product/service name",
  "problem": ["problem 1", "problem 2", "problem 3"],
  "solution": ["solution 1", "solution 2", "solution 3"],
  "keyMetrics": ["metric 1", "metric 2", ...],
  "uniqueValueProposition": "unique value proposition (one line)",
  "unfairAdvantage": ["advantage 1", "advantage 2", ...],
  "channels": ["channel 1", "channel 2", ...],
  "customerSegments": ["segment 1", "segment 2", ...],
  "costStructure": ["cost 1", "cost 2", ...],
  "revenueStreams": ["revenue stream 1", "revenue stream 2", ...]
}

Return only JSON without markdown blocks.`
  }

  const response = await callAI(prompts[language], config)
  return parseJSON(response)
}

export async function generateRoadmap(description: string, language: 'ru' | 'en' = 'ru'): Promise<any> {
  const config = getConfig()
  if (!config) throw new Error('AI не настроен')

  const prompts: Record<string, string> = {
    ru: `Создай Product Roadmap в формате Now-Next-Later для: ${description}

Структура JSON:
{
  "title": "название продукта",
  "description": "краткое описание",
  "now": [
    {
      "title": "название фичи",
      "description": "описание",
      "priority": "high" | "medium" | "low",
      "category": "feature" | "bug_fix" | "tech_debt" | "improvement",
      "effort": "small" | "medium" | "large",
      "status": "planning" | "in_progress" | "done"
    }
  ],
  "next": [ /* та же структура */ ],
  "later": [ /* та же структура */ ]
}

Now - текущий квартал (2-4 фичи)
Next - следующий квартал (3-5 фичи)
Later - будущее (5-7 идей)

Верни только JSON без markdown блоков.`,
    en: `Create a Product Roadmap in Now-Next-Later format for: ${description}

JSON structure:
{
  "title": "product name",
  "description": "brief description",
  "now": [
    {
      "title": "feature title",
      "description": "description",
      "priority": "high" | "medium" | "low",
      "category": "feature" | "bug_fix" | "tech_debt" | "improvement",
      "effort": "small" | "medium" | "large",
      "status": "planning" | "in_progress" | "done"
    }
  ],
  "next": [ /* same structure */ ],
  "later": [ /* same structure */ ]
}

Now - current quarter (2-4 features)
Next - next quarter (3-5 features)
Later - future (5-7 ideas)

Return only JSON without markdown blocks.`
  }

  const response = await callAI(prompts[language], config)
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
