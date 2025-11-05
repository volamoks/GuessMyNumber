// Расширенный AI Service с поддержкой множества провайдеров и генерации

export type AIProvider = 'claude' | 'gemini' | 'openrouter' | 'openai' | 'deepseek'

interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
  baseUrl?: string
}

export class AIService {
  private config: AIConfig | null = null

  configure(provider: AIProvider, apiKey: string, model?: string, baseUrl?: string) {
    this.config = { provider, apiKey, model, baseUrl }
    localStorage.setItem('ai_provider', provider)
    localStorage.setItem(`ai_key_${provider}`, apiKey)
    if (model) localStorage.setItem(`ai_model_${provider}`, model)
    if (baseUrl) localStorage.setItem(`ai_baseurl_${provider}`, baseUrl)
  }

  loadConfig(): AIConfig | null {
    const provider = localStorage.getItem('ai_provider') as AIProvider
    if (!provider) return null

    const apiKey = localStorage.getItem(`ai_key_${provider}`)
    if (!apiKey) return null

    const model = localStorage.getItem(`ai_model_${provider}`) || undefined
    const baseUrl = localStorage.getItem(`ai_baseurl_${provider}`) || undefined

    this.config = { provider, apiKey, model, baseUrl }
    return this.config
  }

  // ============= ГЕНЕРАЦИЯ =============

  async generateCJM(description: string, language: 'ru' | 'en' = 'ru'): Promise<any> {
    if (!this.config) {
      throw new Error('AI не настроен. Пожалуйста, настройте AI провайдера.')
    }

    const prompts = {
      ru: `Создай подробную Customer Journey Map в формате JSON на основе следующего описания бизнеса:

${description}

Верни ТОЛЬКО валидный JSON в следующем формате (без markdown, без комментариев):
{
  "title": "Название CJM",
  "persona": "Описание целевой персоны",
  "description": "Краткое описание journey map",
  "stages": [
    {
      "name": "Название этапа",
      "customerActivities": ["Действие клиента 1", "Действие клиента 2", "Действие клиента 3"],
      "customerGoals": ["Цель клиента 1", "Цель клиента 2"],
      "touchpoints": ["Точка контакта 1", "Точка контакта 2", "Точка контакта 3"],
      "experience": ["Эмоция/чувство 1", "Эмоция/чувство 2", "Эмоция/чувство 3"],
      "positives": ["Положительный момент 1", "Положительный момент 2"],
      "negatives": ["Проблема/боль 1", "Проблема/боль 2", "Проблема/боль 3"],
      "ideasOpportunities": ["Идея/возможность 1", "Идея/возможность 2", "Идея/возможность 3"],
      "businessGoal": "Бизнес-цель для этого этапа",
      "kpis": ["KPI метрика 1", "KPI метрика 2", "KPI метрика 3"],
      "organizationalActivities": ["Активность компании 1", "Активность компании 2"],
      "responsibility": ["Ответственная роль 1", "Ответственная роль 2"],
      "technologySystems": ["Система/инструмент 1", "Система/инструмент 2"]
    }
  ]
}

Создай 5-7 этапов пути клиента. Будь максимально конкретным и детальным для каждого поля.`,
      en: `Create a detailed Customer Journey Map in JSON format based on the following business description:

${description}

Return ONLY valid JSON in the following format (no markdown, no comments):
{
  "title": "CJM Title",
  "persona": "Target persona description",
  "description": "Brief journey map description",
  "stages": [
    {
      "name": "Stage Name",
      "customerActivities": ["Customer action 1", "Customer action 2", "Customer action 3"],
      "customerGoals": ["Customer goal 1", "Customer goal 2"],
      "touchpoints": ["Touchpoint 1", "Touchpoint 2", "Touchpoint 3"],
      "experience": ["Emotion/feeling 1", "Emotion/feeling 2", "Emotion/feeling 3"],
      "positives": ["Positive moment 1", "Positive moment 2"],
      "negatives": ["Pain point/problem 1", "Pain point/problem 2", "Pain point/problem 3"],
      "ideasOpportunities": ["Idea/opportunity 1", "Idea/opportunity 2", "Idea/opportunity 3"],
      "businessGoal": "Business goal for this stage",
      "kpis": ["KPI metric 1", "KPI metric 2", "KPI metric 3"],
      "organizationalActivities": ["Company activity 1", "Company activity 2"],
      "responsibility": ["Responsible role 1", "Responsible role 2"],
      "technologySystems": ["System/tool 1", "System/tool 2"]
    }
  ]
}

Create 5-7 customer journey stages. Be very specific and detailed for each field.`
    }

    const response = await this.callAI(prompts[language])
    return this.parseJSON(response)
  }

  async generateBusinessCanvas(description: string): Promise<any> {
    if (!this.config) {
      throw new Error('AI не настроен. Пожалуйста, настройте AI провайдера.')
    }

    const prompt = `Создай подробный Business Model Canvas в формате JSON на основе следующего описания бизнеса:

${description}

Верни ТОЛЬКО валидный JSON в следующем формате (без markdown, без комментариев):
{
  "title": "Название проекта",
  "keyPartners": ["Партнёр 1", "Партнёр 2", "Партнёр 3"],
  "keyActivities": ["Активность 1", "Активность 2", "Активность 3"],
  "keyResources": ["Ресурс 1", "Ресурс 2", "Ресурс 3"],
  "valueProposition": ["Ценность 1", "Ценность 2", "Ценность 3"],
  "customerRelationships": ["Отношение 1", "Отношение 2"],
  "channels": ["Канал 1", "Канал 2", "Канал 3"],
  "customerSegments": ["Сегмент 1", "Сегмент 2"],
  "costStructure": ["Издержка 1", "Издержка 2", "Издержка 3"],
  "revenueStreams": ["Поток дохода 1", "Поток дохода 2"]
}

Будь конкретным и детальным для каждого блока.`

    const response = await this.callAI(prompt)
    return this.parseJSON(response)
  }

  async generateLeanCanvas(description: string): Promise<any> {
    if (!this.config) {
      throw new Error('AI не настроен. Пожалуйста, настройте AI провайдера.')
    }

    const prompt = `Создай подробный Lean Canvas в формате JSON на основе следующего описания стартапа:

${description}

Верни ТОЛЬКО валидный JSON в следующем формате (без markdown, без комментариев):
{
  "title": "Название стартапа",
  "problem": ["Проблема 1", "Проблема 2", "Проблема 3"],
  "solution": ["Решение 1", "Решение 2", "Решение 3"],
  "keyMetrics": ["Метрика 1", "Метрика 2", "Метрика 3"],
  "uniqueValueProposition": "Уникальное ценностное предложение",
  "unfairAdvantage": ["Преимущество 1", "Преимущество 2"],
  "channels": ["Канал 1", "Канал 2", "Канал 3"],
  "customerSegments": ["Сегмент 1", "Сегмент 2"],
  "costStructure": ["Издержка 1", "Издержка 2", "Издержка 3"],
  "revenueStreams": ["Поток дохода 1", "Поток дохода 2"]
}

Будь конкретным и ориентируйся на валидацию гипотез и lean-методологию.`

    const response = await this.callAI(prompt)
    return this.parseJSON(response)
  }

  // ============= АНАЛИЗ =============

  async analyzeCJM(cjmData: any): Promise<string> {
    if (!this.config) {
      throw new Error('AI не настроен. Пожалуйста, настройте AI провайдера.')
    }

    const prompt = `Проанализируй следующую Customer Journey Map и дай рекомендации по улучшению:

${JSON.stringify(cjmData, null, 2)}

Пожалуйста, предоставь:
1. Анализ текущего пути клиента
2. Выявленные проблемные точки (pain points)
3. Возможности для улучшения
4. Конкретные рекомендации`

    return this.callAI(prompt)
  }

  async analyzeBusinessCanvas(canvasData: any): Promise<string> {
    if (!this.config) {
      throw new Error('AI не настроен. Пожалуйста, настройте AI провайдера.')
    }

    const prompt = `Проанализируй следующий Business Model Canvas и дай рекомендации:

${JSON.stringify(canvasData, null, 2)}

Пожалуйста, предоставь:
1. Оценку сбалансированности модели
2. Сильные стороны
3. Риски и слабые места
4. Рекомендации по оптимизации`

    return this.callAI(prompt)
  }

  async analyzeLeanCanvas(canvasData: any): Promise<string> {
    if (!this.config) {
      throw new Error('AI не настроен. Пожалуйста, настройте AI провайдера.')
    }

    const prompt = `Проанализируй следующий Lean Canvas и дай рекомендации:

${JSON.stringify(canvasData, null, 2)}

Пожалуйста, предоставь:
1. Анализ проблемы и решения
2. Оценку уникального ценностного предложения
3. Анализ метрик и преимуществ
4. Рекомендации по валидации гипотез`

    return this.callAI(prompt)
  }

  // ============= БАЗОВЫЕ МЕТОДЫ =============

  private async callAI(prompt: string): Promise<string> {
    const provider = this.config!.provider

    switch (provider) {
      case 'claude':
        return this.callClaude(prompt)
      case 'gemini':
        return this.callGemini(prompt)
      case 'openrouter':
        return this.callOpenRouter(prompt)
      case 'openai':
        return this.callOpenAI(prompt)
      case 'deepseek':
        return this.callDeepSeek(prompt)
      default:
        throw new Error(`Неизвестный провайдер: ${provider}`)
    }
  }

  private parseJSON(response: string): any {
    // Извлекаем JSON из markdown если есть
    let jsonStr = response.trim()

    // Убираем markdown code blocks
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '')
    }

    // Находим первый { и последний }
    const firstBrace = jsonStr.indexOf('{')
    const lastBrace = jsonStr.lastIndexOf('}')

    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)
    }

    try {
      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('JSON parse error:', error)
      console.error('Response:', response)
      throw new Error('Не удалось распарсить ответ от AI. Попробуйте еще раз.')
    }
  }

  private async callClaude(prompt: string): Promise<string> {
    const model = this.config!.model || 'claude-3-5-sonnet-20241022'
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config!.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Claude API error: ${error}`)
    }

    const data = await response.json()
    return data.content[0].text
  }

  private async callGemini(prompt: string): Promise<string> {
    const model = this.config!.model || 'gemini-pro'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config!.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gemini API error: ${error}`)
    }

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  }

  private async callOpenRouter(prompt: string): Promise<string> {
    const model = this.config!.model || 'anthropic/claude-3.5-sonnet'
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Product Tools'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenRouter API error: ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const model = this.config!.model || 'gpt-4o'
    const baseUrl = this.config!.baseUrl || 'https://api.openai.com/v1'

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  private async callDeepSeek(prompt: string): Promise<string> {
    const model = this.config!.model || 'deepseek-chat'
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config!.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DeepSeek API error: ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  isConfigured(): boolean {
    return this.config !== null
  }

  getProvider(): AIProvider | null {
    return this.config?.provider || null
  }

  clearConfig() {
    this.config = null
    localStorage.removeItem('ai_provider')
    const providers: AIProvider[] = ['claude', 'gemini', 'openrouter', 'openai', 'deepseek']
    providers.forEach(p => {
      localStorage.removeItem(`ai_key_${p}`)
      localStorage.removeItem(`ai_model_${p}`)
      localStorage.removeItem(`ai_baseurl_${p}`)
    })
  }
}

export const aiService = new AIService()
