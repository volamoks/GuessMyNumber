import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, XCircle, Sun, Moon, Monitor } from 'lucide-react'
import * as aiService from '@/lib/ai-service'
import type { AIProvider } from '@/lib/ai-service'
import { useGlobalStore, useThemeStore } from '@/store'

export function SettingsPage() {
  // AI Settings
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

  const handleSaveAI = () => {
    if (!config.provider || !config.apiKey) {
      alert('Выберите провайдера и введите API ключ')
      return
    }
    saveAIConfig()
    alert('Настройки AI сохранены!')
  }

  const handleClearAI = () => {
    clearAIConfig()
  }

  // Theme Settings
  const { theme, setTheme } = useThemeStore()

  const themeOptions = [
    { value: 'light', label: 'Светлая', icon: Sun },
    { value: 'dark', label: 'Темная', icon: Moon },
    { value: 'system', label: 'Системная', icon: Monitor },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Настройки
        </h1>
        <p className="text-muted-foreground mt-2">Настройте AI, тему и другие параметры</p>
      </div>

      <Tabs defaultValue="ai" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai">AI Настройки</TabsTrigger>
          <TabsTrigger value="theme">Тема</TabsTrigger>
        </TabsList>

        {/* AI Settings Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Конфигурация AI</CardTitle>
                {config.isConfigured ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <CardDescription>Настройте AI провайдера для генерации контента</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>AI Провайдер</Label>
                <Select value={config.provider} onValueChange={setAIProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите провайдера" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude">Claude (Anthropic)</SelectItem>
                    <SelectItem value="gemini">Gemini (Google)</SelectItem>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.provider && (
                <>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showApiKey ? 'text' : 'password'}
                        value={config.apiKey}
                        onChange={(e) => setAIKey(e.target.value)}
                        placeholder="Введите API ключ"
                      />
                      <Button variant="outline" onClick={() => setShowApiKey(!showApiKey)}>
                        {showApiKey ? 'Скрыть' : 'Показать'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Модель (опционально)</Label>
                    <Input
                      value={config.model}
                      onChange={(e) => setAIModel(e.target.value)}
                      placeholder="Оставьте пустым для модели по умолчанию"
                    />
                  </div>

                  {(config.provider === 'openrouter' || config.provider === 'deepseek') && (
                    <div className="space-y-2">
                      <Label>Base URL (опционально)</Label>
                      <Input
                        value={config.baseUrl}
                        onChange={(e) => setAIBaseUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveAI}>Сохранить настройки</Button>
                {config.isConfigured && (
                  <Button variant="outline" onClick={handleClearAI}>
                    Очистить
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings Tab */}
        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Тема оформления</CardTitle>
              <CardDescription>Выберите тему для интерфейса</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themeOptions.map((option) => {
                  const Icon = option.icon
                  const isActive = theme === option.value
                  return (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isActive ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setTheme(option.value as any)}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-6 space-y-2">
                        <Icon className={`h-12 w-12 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>{option.label}</p>
                        {isActive && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium">Выбранная тема: {themeOptions.find((o) => o.value === theme)?.label}</h4>
                <p className="text-sm text-muted-foreground">
                  {theme === 'system'
                    ? 'Тема будет автоматически меняться в зависимости от системных настроек'
                    : theme === 'dark'
                    ? 'Темная тема с темным фоном и светлым текстом'
                    : 'Светлая тема с белым фоном и темным текстом'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
