import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AIProvider } from '@/lib/ai-service'
import { useGlobalStore, type AIModelConfig } from '@/store'
import { CheckCircle2, Trash2, Plus, Eye, EyeOff } from 'lucide-react'

export function AISettingsPage() {
  const {
    aiModels,
    activeModelId,
    addAIModel,
    updateAIModel,
    deleteAIModel,
    setActiveModel,
  } = useGlobalStore()

  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})

  // Form state for new/editing model
  const [formData, setFormData] = useState<Partial<AIModelConfig>>({
    name: '',
    provider: 'claude',
    apiKey: '',
    model: '',
    baseUrl: '',
  })

  const resetForm = () => {
    setFormData({
      name: '',
      provider: 'claude',
      apiKey: '',
      model: '',
      baseUrl: '',
    })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleAdd = () => {
    if (!formData.name || !formData.apiKey || !formData.provider) {
      alert('Заполните название, провайдера и API ключ')
      return
    }

    addAIModel({
      name: formData.name,
      provider: formData.provider as AIProvider,
      apiKey: formData.apiKey,
      model: formData.model || '',
      baseUrl: formData.baseUrl || '',
    })

    resetForm()
  }

  const handleUpdate = () => {
    if (!editingId) return

    updateAIModel(editingId, {
      name: formData.name,
      provider: formData.provider as AIProvider,
      apiKey: formData.apiKey,
      model: formData.model,
      baseUrl: formData.baseUrl,
    })

    resetForm()
  }

  const startEdit = (model: AIModelConfig) => {
    setFormData(model)
    setEditingId(model.id)
    setIsAdding(false)
  }

  const toggleApiKeyVisibility = (modelId: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [modelId]: !prev[modelId],
    }))
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Models</h1>
        <p className="text-muted-foreground">Управление AI моделями</p>
      </div>

      {/* Existing Models */}
      <div className="space-y-4">
        {aiModels.map((model) => (
          <Card key={model.id} className={activeModelId === model.id ? 'border-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{model.name}</CardTitle>
                  {activeModelId === model.id && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveModel(model.id)}
                    disabled={activeModelId === model.id}
                  >
                    {activeModelId === model.id ? 'Активна' : 'Активировать'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(model)}>
                    Редактировать
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Удалить модель "${model.name}"?`)) {
                        deleteAIModel(model.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                {model.provider} • {model.model || 'Default model'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">API Key:</span>
                  <code className="px-2 py-1 bg-muted rounded">
                    {showApiKeys[model.id]
                      ? model.apiKey
                      : '•'.repeat(Math.min(model.apiKey.length, 40))}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleApiKeyVisibility(model.id)}
                  >
                    {showApiKeys[model.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {model.baseUrl && (
                  <div>
                    <span className="font-medium">Base URL:</span> {model.baseUrl}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Редактировать модель' : 'Добавить новую модель'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название модели</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Моя Claude модель"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">AI Провайдер</Label>
              <Select
                value={formData.provider}
                onValueChange={(value) => setFormData({ ...formData, provider: value as AIProvider })}
              >
                <SelectTrigger id="provider">
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

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Ключ</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="sk-..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Модель (опционально)</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="claude-3-opus-20240229"
              />
            </div>

            {formData.provider === 'openai' && (
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL (опционально)</Label>
                <Input
                  id="baseUrl"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={editingId ? handleUpdate : handleAdd}>
                {editingId ? 'Сохранить' : 'Добавить'}
              </Button>
              <Button onClick={resetForm} variant="outline">
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      {!isAdding && !editingId && (
        <Button onClick={() => setIsAdding(true)} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Добавить модель
        </Button>
      )}

      {aiModels.length === 0 && !isAdding && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            Нет сохраненных моделей. Добавьте первую модель для начала работы.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
