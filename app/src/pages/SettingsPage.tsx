import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Sun, Moon, Monitor, Plus, Edit2, Trash2, Check } from 'lucide-react'
import * as aiService from '@/lib/ai-service'
import type { AIProvider } from '@/lib/ai-service'
import { useGlobalStore, useThemeStore, type AIModelConfig } from '@/store'

export function SettingsPage() {
  // AI Models Management
  const {
    aiModels,
    activeModelId,
    addAIModel,
    updateAIModel,
    deleteAIModel,
    setActiveModel,
    ai: config,
    setAIProvider,
    setAIKey,
    setAIModel,
    setAIBaseUrl,
    saveAIConfig,
    clearAIConfig,
  } = useGlobalStore()

  // Form state for adding/editing models
  const [isAddingModel, setIsAddingModel] = useState(false)
  const [editingModelId, setEditingModelId] = useState<string | null>(null)
  const [modelForm, setModelForm] = useState<Omit<AIModelConfig, 'id'>>({
    name: '',
    provider: 'claude',
    apiKey: '',
    model: '',
    baseUrl: '',
  })

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

  // AI Models handlers
  const handleAddModel = () => {
    if (!modelForm.name || !modelForm.provider || !modelForm.apiKey) {
      alert('Заполните обязательные поля: название, провайдер, API ключ')
      return
    }
    addAIModel(modelForm)
    setModelForm({
      name: '',
      provider: 'claude',
      apiKey: '',
      model: '',
      baseUrl: '',
    })
    setIsAddingModel(false)
    alert('Модель добавлена!')
  }

  const handleEditModel = (model: AIModelConfig) => {
    setEditingModelId(model.id)
    setModelForm({
      name: model.name,
      provider: model.provider,
      apiKey: model.apiKey,
      model: model.model,
      baseUrl: model.baseUrl,
    })
  }

  const handleUpdateModel = () => {
    if (!editingModelId) return
    if (!modelForm.name || !modelForm.provider || !modelForm.apiKey) {
      alert('Заполните обязательные поля')
      return
    }
    updateAIModel(editingModelId, modelForm)
    setEditingModelId(null)
    setModelForm({
      name: '',
      provider: 'claude',
      apiKey: '',
      model: '',
      baseUrl: '',
    })
    alert('Модель обновлена!')
  }

  const handleDeleteModel = (id: string) => {
    if (!confirm('Удалить эту модель?')) return
    deleteAIModel(id)
  }

  const handleCancelEdit = () => {
    setEditingModelId(null)
    setIsAddingModel(false)
    setModelForm({
      name: '',
      provider: 'claude',
      apiKey: '',
      model: '',
      baseUrl: '',
    })
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

      <Tabs defaultValue="models" className="space-y-4">
        <TabsList>
          <TabsTrigger value="models">AI Модели</TabsTrigger>
          <TabsTrigger value="ai">AI Настройки (Legacy)</TabsTrigger>
          <TabsTrigger value="theme">Тема</TabsTrigger>
        </TabsList>

        {/* AI Models Tab - NEW */}
        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Модели</CardTitle>
                  <CardDescription>Управляйте несколькими AI моделями</CardDescription>
                </div>
                <Button onClick={() => setIsAddingModel(true)} disabled={isAddingModel || editingModelId !== null}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить модель
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add/Edit Model Form */}
              {(isAddingModel || editingModelId) && (
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {editingModelId ? 'Редактировать модель' : 'Новая модель'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Название модели *</Label>
                      <Input
                        placeholder="Например: Claude для разработки"
                        value={modelForm.name}
                        onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Провайдер *</Label>
                      <Select
                        value={modelForm.provider}
                        onValueChange={(val: AIProvider) => setModelForm({ ...modelForm, provider: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
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

                    <div className="space-y-2">
                      <Label>API Key *</Label>
                      <Input
                        type="password"
                        placeholder="sk-..."
                        value={modelForm.apiKey}
                        onChange={(e) => setModelForm({ ...modelForm, apiKey: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Модель (опционально)</Label>
                      <Input
                        placeholder="claude-3-5-sonnet-20241022, gpt-4, etc."
                        value={modelForm.model}
                        onChange={(e) => setModelForm({ ...modelForm, model: e.target.value })}
                      />
                    </div>

                    {(modelForm.provider === 'openrouter' || modelForm.provider === 'deepseek') && (
                      <div className="space-y-2">
                        <Label>Base URL (опционально)</Label>
                        <Input
                          placeholder="https://..."
                          value={modelForm.baseUrl}
                          onChange={(e) => setModelForm({ ...modelForm, baseUrl: e.target.value })}
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={editingModelId ? handleUpdateModel : handleAddModel}>
                        <Check className="h-4 w-4 mr-2" />
                        {editingModelId ? 'Сохранить' : 'Добавить'}
                      </Button>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Отмена
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Models List */}
              {aiModels.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground mb-4">Нет сохраненных моделей</p>
                  <Button onClick={() => setIsAddingModel(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить первую модель
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aiModels.map((model) => (
                    <Card
                      key={model.id}
                      className={`relative ${activeModelId === model.id ? 'ring-2 ring-primary' : ''}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{model.name}</CardTitle>
                              {activeModelId === model.id && (
                                <Badge className="bg-green-500">
                                  <Check className="h-3 w-3 mr-1" />
                                  Активна
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="mt-1">
                              {model.provider} {model.model && `• ${model.model}`}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex gap-2">
                          {activeModelId !== model.id && (
                            <Button size="sm" onClick={() => setActiveModel(model.id)}>
                              Использовать
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditModel(model)}
                            disabled={isAddingModel || editingModelId !== null}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Редактировать
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive"
                            onClick={() => handleDeleteModel(model.id)}
                            disabled={isAddingModel || editingModelId !== null}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Удалить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
