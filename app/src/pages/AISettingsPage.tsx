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
  const [isConfigured, setIsConfigured] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    const config = aiService.loadConfig()
    if (config) {
      setProvider(config.provider)
      setApiKey('••••••••••••••••') // Скрываем ключ
      setIsConfigured(true)
    }
  }, [])

  const handleSave = () => {
    if (!provider || !apiKey || apiKey === '••••••••••••••••') {
      alert('Пожалуйста, выберите провайдера и введите API ключ')
      return
    }

    aiService.configure(provider as AIProvider, apiKey)
    setIsConfigured(true)
    alert('Настройки сохранены!')
  }

  const handleClear = () => {
    aiService.clearConfig()
    setProvider('')
    setApiKey('')
    setIsConfigured(false)
  }

  const handleApiKeyChange = (value: string) => {
    setApiKey(value)
    if (isConfigured && value !== '••••••••••••••••') {
      setIsConfigured(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Settings</h1>
        <p className="text-muted-foreground">
          Настройте интеграцию с AI для анализа ваших проектов
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Настройка AI провайдера</CardTitle>
          <CardDescription>
            Выберите AI провайдера и введите API ключ для включения AI-анализа
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
              onChange={(e) => setProvider(e.target.value as AIProvider)}
            >
              <option value="">-- Выберите провайдера --</option>
              <option value="claude">Claude (Anthropic)</option>
              <option value="gemini">Gemini (Google)</option>
            </Select>
          </div>

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
              <li>Скопируйте ключ и вставьте его выше</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Gemini (Google)</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Перейдите на <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a></li>
              <li>Войдите с Google аккаунтом</li>
              <li>Нажмите "Get API Key"</li>
              <li>Создайте новый ключ</li>
              <li>Скопируйте ключ и вставьте его выше</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
