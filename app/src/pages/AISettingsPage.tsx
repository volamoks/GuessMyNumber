import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as aiService from '@/lib/ai-service'
import type { AIProvider } from '@/lib/ai-service'
import { useGlobalStore } from '@/store'
import { CheckCircle2, XCircle } from 'lucide-react'

export function AISettingsPage() {
  // Use global store for AI config
  const {
    ai: config,
    setAIProvider,
    setAIKey,
    setAIModel,
    setAIBaseUrl,
    saveAIConfig,
    clearAIConfig,
  } = useGlobalStore()

  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    if (config.provider && config.apiKey) {
      aiService.setAIConfig({
        provider: config.provider as AIProvider,
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
      })
    }
  }, [config])

  const handleSave = () => {
    if (!config.provider || !config.apiKey) {
      alert('Выберите провайдера и введите API ключ')
      return
    }
    saveAIConfig()
    alert('Настройки сохранены!')
  }

  const handleClear = () => {
    clearAIConfig()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Settings</h1>
        <p className="text-muted-foreground">Настройте AI провайдера</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Конфигурация AI</CardTitle>
            {config.isConfigured ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Провайдер</label>
            <Select value={config.provider} onValueChange={setAIProvider}>
              <SelectTrigger><SelectValue placeholder="Выберите провайдера" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="deepseek">DeepSeek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.provider && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Модель (опционально)</label>
                <Input value={config.model} onChange={(e) => setAIModel(e.target.value)} />
              </div>
              {config.provider === 'openai' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base URL</label>
                  <Input value={config.baseUrl} onChange={(e) => setAIBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1" />
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">API Ключ</label>
            <div className="flex gap-2">
              <Input type={showApiKey ? 'text' : 'password'} value={config.apiKey} onChange={(e) => setAIKey(e.target.value)} />
              <Button variant="outline" onClick={() => setShowApiKey(!showApiKey)}>{showApiKey ? 'Скрыть' : 'Показать'}</Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave}>Сохранить</Button>
            <Button onClick={handleClear} variant="outline">Очистить</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
