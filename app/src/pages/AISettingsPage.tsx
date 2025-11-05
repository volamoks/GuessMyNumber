import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { aiService, type AIProvider } from '@/lib/ai-service'
import { CheckCircle2, XCircle } from 'lucide-react'

export function AISettingsPage() {
  const [provider, setProvider] = useState<AIProvider | ''>('')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    const config = aiService.loadConfig()
    if (config) {
      setProvider(config.provider)
      setApiKey('••••••••••••••••')
      setModel(config.model || '')
      setBaseUrl(config.baseUrl || '')
      setIsConfigured(true)
    }
  }, [])

  const handleSave = () => {
    if (!provider || !apiKey || apiKey === '••••••••••••••••') {
      alert('Пожалуйста, выберите провайдера и введите API ключ')
      return
    }

    aiService.configure(provider as AIProvider, apiKey, model || undefined, baseUrl || undefined)
    setIsConfigured(true)
    alert('Настройки сохранены!')
  }

  const handleClear = () => {
    aiService.clearConfig()
    setProvider('')
    setApiKey('')
    setModel('')
    setBaseUrl('')
    setIsConfigured(false)
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    if (isConfigured && value !== '••••••••••••••••') {
      setIsConfigured(false)
    }
  }

  const getDefaultModel = (provider: AIProvider) => {
    switch (provider) {
      case 'claude': return 'claude-3-5-sonnet-20241022'
      case 'gemini': return 'gemini-pro'
      case 'openrouter': return 'anthropic/claude-3.5-sonnet'
      case 'openai': return 'gpt-4o'
      case 'deepseek': return 'deepseek-chat'
      default: return ''
    }
  }

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider as AIProvider)
    if (newProvider) {
      setModel(getDefaultModel(newProvider as AIProvider))
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Settings</h1>
        <p className="text-muted-foreground">
          Настройте интеграцию с AI для генерации и анализа ваших проектов
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Настройка AI провайдера</CardTitle>
          <CardDescription>
            Выберите AI провайдера и введите API ключ для включения AI-функций
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="provider" className="text-sm font-medium">
              AI Провайдер
            </label>
            <Select
              id="provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value)}
            >
              <option value="">-- Выберите провайдера --</option>
              <option value="claude">Claude (Anthropic)</option>
              <option value="gemini">Gemini (Google)</option>
              <option value="openrouter">OpenRouter</option>
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
            </Select>
          </div>

          {provider && (
            <>
              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium">
                  Модель (опционально)
                </label>
                <Input
                  id="model"
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder={`По умолчанию: ${getDefaultModel(provider as AIProvider)}`}
                />
                <p className="text-xs text-muted-foreground">
                  Оставьте пустым для использования модели по умолчанию
                </p>
              </div>

              {provider === 'openai' && (
                <div className="space-y-2">
                  <label htmlFor="baseUrl" className="text-sm font-medium">
                    Base URL (опционально)
                  </label>
                  <Input
                    id="baseUrl"
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Для использования кастомного API endpoint
                  </p>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium">
              API Ключ
            </label>
            <div className="flex gap-2">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Введите ваш API ключ"
              />
              <Button
                variant="outline"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? 'Скрыть' : 'Показать'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ваш API ключ сохраняется локально в браузере и не передаётся на сервер
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {isConfigured ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">AI настроен</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-5 w-5" />
                <span className="text-sm font-medium">AI не настроен</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave}>
              Сохранить настройки
            </Button>
            {isConfigured && (
              <Button onClick={handleClear} variant="outline">
                Очистить настройки
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Как получить API ключ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Claude (Anthropic)</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Перейдите на <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.anthropic.com</a></li>
              <li>Зарегистрируйтесь или войдите в аккаунт</li>
              <li>Перейдите в раздел "API Keys"</li>
              <li>Создайте новый API ключ</li>
              <li>Модели: claude-3-5-sonnet-20241022, claude-3-opus-20240229</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Gemini (Google)</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Перейдите на <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
              <li>Войдите с Google аккаунтом</li>
              <li>Нажмите "Get API Key"</li>
              <li>Создайте новый ключ</li>
              <li>Модели: gemini-pro, gemini-1.5-pro</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">OpenRouter</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Перейдите на <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai</a></li>
              <li>Зарегистрируйтесь</li>
              <li>Перейдите в Keys</li>
              <li>Создайте новый ключ</li>
              <li>Модели: anthropic/claude-3.5-sonnet, google/gemini-pro, openai/gpt-4o</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">OpenAI</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Перейдите на <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a></li>
              <li>Войдите в аккаунт</li>
              <li>Создайте новый API ключ</li>
              <li>Модели: gpt-4o, gpt-4-turbo, gpt-3.5-turbo</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">DeepSeek</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Перейдите на <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.deepseek.com</a></li>
              <li>Зарегистрируйтесь</li>
              <li>Создайте API ключ</li>
              <li>Модели: deepseek-chat, deepseek-coder</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">💡 Новые возможности</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>✨ <strong>AI Генерация</strong> - создавайте CJM и Canvas из описания бизнеса</li>
            <li>🔍 <strong>AI Анализ</strong> - получайте рекомендации и инсайты</li>
            <li>📊 <strong>Экспорт в PDF</strong> - скачивайте красивые отчёты</li>
            <li>🎨 <strong>5 AI провайдеров</strong> - выбирайте лучший для вас</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
