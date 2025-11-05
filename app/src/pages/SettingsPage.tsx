import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Sun, Moon, Monitor, Plus, Edit2, Trash2, Check, CheckCircle2, Clock, Zap, AlertCircle } from 'lucide-react'
import type { AIProvider } from '@/lib/ai-service'
import { useGlobalStore, useThemeStore, type AIModelConfig } from '@/store'
import { promptLogsService, type PromptLog } from '@/lib/prompt-logs-service'
import { toast } from 'sonner'

export function SettingsPage() {
  // AI Models Management
  const {
    aiModels,
    activeModelId,
    addAIModel,
    updateAIModel,
    deleteAIModel,
    setActiveModel,
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

  // AI Models handlers
  const handleAddModel = () => {
    if (!modelForm.name || !modelForm.provider || !modelForm.apiKey) {
      toast.error('Заполните обязательные поля: название, провайдер, API ключ')
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
    toast.success('Модель добавлена!')
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
      toast.error('Заполните обязательные поля')
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
    toast.success('Модель обновлена!')
  }

  const handleDeleteModel = (id: string) => {
    if (!confirm('Удалить эту модель?')) return
    deleteAIModel(id)
    toast.success('Модель удалена')
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
  const { theme, setTheme, colorScheme, setColorScheme } = useThemeStore()

  const themeOptions = [
    { value: 'light', label: 'Светлая', icon: Sun },
    { value: 'dark', label: 'Темная', icon: Moon },
    { value: 'system', label: 'Системная', icon: Monitor },
  ]

  const colorSchemeOptions = [
    {
      value: 'default',
      label: 'По умолчанию',
      description: 'Классическая сине-фиолетовая палитра',
      colors: ['#6366f1', '#818cf8', '#4f46e5']
    },
    {
      value: 'bubblegum',
      label: 'Bubblegum',
      description: 'Игривая розово-пурпурная палитра',
      colors: ['#ec4899', '#f472b6', '#d946ef']
    },
    {
      value: 'clean-slate',
      label: 'Clean Slate',
      description: 'Минималистичная серая палитра',
      colors: ['#525252', '#737373', '#a3a3a3']
    },
  ]

  // Prompt Logs
  const [promptLogs, setPromptLogs] = useState<PromptLog[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [selectedLog, setSelectedLog] = useState<PromptLog | null>(null)

  // Load prompt logs when tab is opened
  const loadPromptLogs = async () => {
    setIsLoadingLogs(true)
    try {
      const logs = await promptLogsService.getLogs({ limit: 50 })
      setPromptLogs(logs)
    } catch (error) {
      console.error('Failed to load prompt logs:', error)
    } finally {
      setIsLoadingLogs(false)
    }
  }

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
          <TabsTrigger value="theme">Тема</TabsTrigger>
          <TabsTrigger value="prompt-logs">История промптов</TabsTrigger>
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

          <Card>
            <CardHeader>
              <CardTitle>Цветовая схема</CardTitle>
              <CardDescription>Выберите цветовую палитру для интерфейса</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {colorSchemeOptions.map((option) => {
                  const isActive = colorScheme === option.value
                  return (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        isActive ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setColorScheme(option.value as any)}
                    >
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className={`font-medium ${isActive ? 'text-primary' : ''}`}>{option.label}</p>
                            {isActive && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {option.colors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full border-2 border-background shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompt Logs Tab */}
        <TabsContent value="prompt-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>История промптов</CardTitle>
                  <CardDescription>Просмотр всех AI запросов и ответов</CardDescription>
                </div>
                <Button onClick={loadPromptLogs} disabled={isLoadingLogs}>
                  {isLoadingLogs ? 'Загрузка...' : 'Обновить'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingLogs ? (
                <div className="text-center py-8 text-muted-foreground">Загрузка логов...</div>
              ) : promptLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>История пуста</p>
                  <p className="text-sm mt-2">Логи AI запросов будут отображаться здесь</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {promptLogs.map((log) => (
                    <Card
                      key={log.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedLog?.id === log.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                {log.operation_type}
                              </Badge>
                              {log.model_provider && (
                                <Badge variant="outline">{log.model_provider}</Badge>
                              )}
                              {log.status === 'error' && (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(log.created_at).toLocaleString('ru-RU')}
                              </span>
                              {log.duration_ms && (
                                <span className="flex items-center gap-1">
                                  <Zap className="h-3 w-3" />
                                  {log.duration_ms}ms
                                </span>
                              )}
                              {log.model_name && (
                                <span className="truncate">{log.model_name}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded view */}
                        {selectedLog?.id === log.id && (
                          <div className="mt-4 space-y-4 border-t pt-4">
                            <div>
                              <h4 className="font-medium mb-2">Промпт:</h4>
                              <div className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                                {log.prompt}
                              </div>
                            </div>

                            {log.response && (
                              <div>
                                <h4 className="font-medium mb-2">Ответ:</h4>
                                <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                                  {log.response.substring(0, 1000)}
                                  {log.response.length > 1000 && '... (обрезано)'}
                                </div>
                              </div>
                            )}

                            {log.error_message && (
                              <div>
                                <h4 className="font-medium mb-2 text-destructive">Ошибка:</h4>
                                <div className="bg-destructive/10 p-3 rounded-md text-sm text-destructive">
                                  {log.error_message}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
