// AI Service для интеграции с Claude и Gemini

export type AIProvider = 'claude' | 'gemini'

interface AIConfig {
  provider: AIProvider
  apiKey: string
}

export class AIService {
  private config: AIConfig | null = null

  configure(provider: AIProvider, apiKey: string) {
    this.config = { provider, apiKey }
    // Сохраняем в localStorage для персистентности
    localStorage.setItem('ai_provider', provider)
    localStorage.setItem(`ai_key_${provider}`, apiKey)
  }

  loadConfig(): AIConfig | null {
    const provider = localStorage.getItem('ai_provider') as AIProvider
    if (!provider) return null

    const apiKey = localStorage.getItem(`ai_key_${provider}`)
    if (!apiKey) return null

    this.config = { provider, apiKey }
    return this.config
  }

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

    if (this.config.provider === 'claude') {
      return this.callClaude(prompt)
    } else {
      return this.callGemini(prompt)
    }
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

    if (this.config.provider === 'claude') {
      return this.callClaude(prompt)
    } else {
      return this.callGemini(prompt)
    }
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

    if (this.config.provider === 'claude') {
      return this.callClaude(prompt)
    } else {
      return this.callGemini(prompt)
    }
  }

  private async callClaude(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config!.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: prompt }
        ]
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.config!.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
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

  isConfigured(): boolean {
    return this.config !== null
  }

  getProvider(): AIProvider | null {
    return this.config?.provider || null
  }

  clearConfig() {
    this.config = null
    localStorage.removeItem('ai_provider')
    localStorage.removeItem('ai_key_claude')
    localStorage.removeItem('ai_key_gemini')
  }
}

export const aiService = new AIService()
