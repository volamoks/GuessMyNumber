
import { useState } from 'react'
import { useAIStore, type AIProvider, type AIModelConfig, type AIFeature } from '@/store/aiStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Check, Plus, Trash2, Settings2, Activity, Play } from 'lucide-react'
import { checkConnection } from '@/lib/ai/vercel-ai'

export function SettingsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Настройки AI</h1>
        <p className="text-muted-foreground mt-2">
          Управление ключами, моделями и назначениями
        </p>
      </div>

      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">API Ключи</TabsTrigger>
          <TabsTrigger value="models">Модели</TabsTrigger>
          <TabsTrigger value="assignment">Назначение</TabsTrigger>
        </TabsList>

        {/* API KEYS TAB */}
        <TabsContent value="keys" className="mt-6 space-y-6">
          <ApiKeysSection />
        </TabsContent>

        {/* MODELS MANAGEMENT TAB */}
        <TabsContent value="models" className="mt-6 space-y-6">
          <ModelManagementSection />
        </TabsContent>

        {/* ASSIGNMENT TAB */}
        <TabsContent value="assignment" className="mt-6 space-y-6">
          <AssignmentSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// --- Sections ---

function ApiKeysSection() {
  const { googleApiKey, openaiApiKey, openrouterApiKey, setApiKey } = useAIStore()



  return (
    <Card>
      <CardHeader>
        <CardTitle>API Ключи Провайдеров</CardTitle>
        <CardDescription>
          Ключи хранятся только в вашем браузере (localStorage)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Google Gemini API Key</Label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={googleApiKey}
              onChange={(e) => setApiKey('google', e.target.value)}
              placeholder="AIza..."
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>OpenAI API Key</Label>
          <Input
            type="password"
            value={openaiApiKey}
            onChange={(e) => setApiKey('openai', e.target.value)}
            placeholder="sk-..."
          />
        </div>

        <div className="grid gap-2">
          <Label>OpenRouter API Key</Label>
          <Input
            type="password"
            value={openrouterApiKey}
            onChange={(e) => setApiKey('openrouter', e.target.value)}
            placeholder="sk-or-..."
          />
        </div>

        <div className="grid gap-2">
          <Label>Groq API Key (Free)</Label>
          <div className="flex gap-2">
            <Input
              type="password"
              value={useAIStore().groqApiKey}
              onChange={(e) => setApiKey('groq', e.target.value)}
              placeholder="gsk_..."
            />
            <Button variant="outline" asChild>
              <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">
                Get Key
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ModelManagementSection() {
  const { configuredModels, deleteModel } = useAIStore()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<AIModelConfig | null>(null)

  const handleDelete = (id: string) => {
    if (confirm('Удалить эту модель?')) {
      deleteModel(id)
      toast.success('Модель удалена')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ваши Модели</h3>
        <ModelDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>

      <div className="grid gap-4">
        {configuredModels.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onDelete={() => handleDelete(model.id)}
            onEdit={() => setEditingModel(model)}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      {editingModel && (
        <ModelDialog
          open={!!editingModel}
          onOpenChange={(open) => !open && setEditingModel(null)}
          modelToEdit={editingModel}
        />
      )}
    </div>
  )
}

function ModelCard({ model, onDelete, onEdit }: { model: AIModelConfig; onDelete: () => void; onEdit: () => void }) {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  const testConnection = async () => {
    setStatus('testing')
    try {
      await checkConnection(model)
      setStatus('success')
      toast.success('Соединение успешно!')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (e) {
      setStatus('error')
      console.error(e)
      toast.error(`Ошибка: ${e instanceof Error ? e.message : 'Unknown error'}`)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="h-10 w-10 bg-muted rounded-lg" onClick={onEdit}>
            <Settings2 className="h-5 w-5 text-muted-foreground" />
          </Button>
          <div>
            <h4 className="font-semibold cursor-pointer hover:underline" onClick={onEdit}>{model.name}</h4>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="capitalize px-1.5 py-0.5 bg-secondary rounded text-xs">
                {model.provider}
              </span>
              <span>{model.modelId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={status === 'success' ? 'default' : 'outline'}
            size="sm"
            onClick={testConnection}
            disabled={status === 'testing'}
            className={status === 'error' ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}
          >
            {status === 'testing' ? (
              <Activity className="h-4 w-4 animate-spin mr-2" />
            ) : status === 'success' ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {status === 'testing' ? 'Проверка...' : status === 'success' ? 'Работает' : 'Проверить'}
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ModelDialog({ open, onOpenChange, modelToEdit }: { open: boolean; onOpenChange: (open: boolean) => void; modelToEdit?: AIModelConfig }) {
  const { addModel, updateModel, googleApiKey, openaiApiKey, openrouterApiKey, groqApiKey, setApiKey } = useAIStore()
  const [provider, setProvider] = useState<AIProvider>(modelToEdit?.provider || 'google')
  const [name, setName] = useState(modelToEdit?.name || '')
  const [modelId, setModelId] = useState(modelToEdit?.modelId || '')
  const [baseUrl, setBaseUrl] = useState(modelToEdit?.baseUrl || '')
  const [apiKey, setApiKeyInternal] = useState(modelToEdit?.apiKey || '')

  // Reset form when opening for add, or setting fields when editing
  useState(() => {
    if (modelToEdit) {
      setProvider(modelToEdit.provider)
      setName(modelToEdit.name)
      setModelId(modelToEdit.modelId)
      setBaseUrl(modelToEdit.baseUrl || '')
      setApiKeyInternal(modelToEdit.apiKey || '')
    } else {
      setProvider('google')
      setName('')
      setModelId('')
      setBaseUrl('')
      setApiKeyInternal('')
    }
  })

  const handleSave = () => {
    if (!name || !modelId) return

    const config = {
      name,
      provider,
      modelId,
      baseUrl: provider === 'local' ? baseUrl : undefined,
      apiKey: provider === 'local' ? apiKey : undefined,
    }

    if (modelToEdit) {
      updateModel(modelToEdit.id, config)
      toast.success('Модель обновлена')
    } else {
      addModel({
        ...config,
        isEnabled: true
      })
      toast.success('Модель добавлена')
    }

    onOpenChange(false)
    if (!modelToEdit) {
      setName('')
      setModelId('')
      setBaseUrl('')
      setApiKeyInternal('')
    }
  }

  const applyPreset = (type: 'lmstudio' | 'ollama' | 'openrouter') => {
    // Use relative proxy paths to bypass CORS/PNA issues
    if (type === 'lmstudio') setBaseUrl('/lms-proxy/v1')
    if (type === 'ollama') setBaseUrl('/ollama-proxy/v1')
    if (type === 'openrouter') setBaseUrl('https://openrouter.ai/api/v1')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!modelToEdit && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Добавить модель
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modelToEdit ? 'Редактировать модель' : 'Новая модель'}</DialogTitle>
          <DialogDescription>
            Настройте параметры подключения к AI модели.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Имя (для отображения)</Label>
            <Input
              placeholder="Например: Мой Gemini"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Провайдер</Label>
            <Select value={provider} onValueChange={(v: AIProvider) => setProvider(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="openrouter">OpenRouter</SelectItem>
                <SelectItem value="groq">Groq (Fast & Free)</SelectItem>
                <SelectItem value="deepseek">DeepSeek (Direct API)</SelectItem>
                <SelectItem value="local">Custom / OpenAI-Compatible (Universal)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Inline API Key Input if missing */}
          {provider === 'google' && !googleApiKey && (
            <div className="grid gap-2 p-3 border border-amber-200 bg-amber-50 rounded-md">
              <Label className="text-amber-800">⚠️ Google API Key Required</Label>
              <Input type="password" placeholder="AIza..." onChange={e => setApiKey('google', e.target.value)} />
            </div>
          )}
          {provider === 'openai' && !openaiApiKey && (
            <div className="grid gap-2 p-3 border border-amber-200 bg-amber-50 rounded-md">
              <Label className="text-amber-800">⚠️ OpenAI API Key Required</Label>
              <Input type="password" placeholder="sk-..." onChange={e => setApiKey('openai', e.target.value)} />
            </div>
          )}
          {provider === 'openrouter' && !openrouterApiKey && (
            <div className="grid gap-2 p-3 border border-amber-200 bg-amber-50 rounded-md">
              <Label className="text-amber-800">⚠️ OpenRouter API Key Required</Label>
              <Input type="password" placeholder="sk-or-..." onChange={e => setApiKey('openrouter', e.target.value)} />
            </div>
          )}
          {provider === 'groq' && !groqApiKey && (
            <div className="grid gap-2 p-3 border border-amber-200 bg-amber-50 rounded-md">
              <Label className="text-amber-800">⚠️ Groq API Key Required</Label>
              <div className="flex gap-2">
                <Input type="password" placeholder="gsk_..." onChange={e => setApiKey('groq', e.target.value)} />
                <Button variant="outline" size="sm" asChild><a href="https://console.groq.com/keys" target="_blank">Get</a></Button>
              </div>
            </div>
          )}

          {provider === 'local' && (
            <div className="grid gap-2">
              <Label>Base URL</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://api.openai.com/v1"
                  value={baseUrl}
                  onChange={e => setBaseUrl(e.target.value)}
                />
              </div>
              <Label>API Key (Optional / Per-model)</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={e => setApiKeyInternal(e.target.value)}
              />
              <div className="flex gap-2 text-xs">
                <Button variant="outline" size="sm" onClick={() => applyPreset('lmstudio')}>LM Studio</Button>
                <Button variant="outline" size="sm" onClick={() => applyPreset('ollama')}>Ollama</Button>
                <Button variant="outline" size="sm" onClick={() => applyPreset('openrouter')}>OpenRouter</Button>
              </div>
            </div>
          )}

          <Label>ID Модели</Label>
          {provider === 'google' ? (
            <div className="space-y-2">
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger><SelectValue placeholder="Выберите Google модель" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : provider === 'groq' ? (
            <div className="space-y-2">
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger><SelectValue placeholder="Выберите Groq модель" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="distil-whisper-large-v3-en">Whisper Large V3 (Audio)</SelectItem>
                  <SelectItem value="llama3-8b-8192">Llama 3 8B</SelectItem>
                  <SelectItem value="llama3-70b-8192">Llama 3 70B</SelectItem>
                  <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : provider === 'deepseek' ? (
            <div className="space-y-2">
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger><SelectValue placeholder="Выберите DeepSeek модель" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek-chat">DeepSeek V3 (Chat)</SelectItem>
                  <SelectItem value="deepseek-reasoner">DeepSeek R1 (Reasoner)</SelectItem>
                  <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : provider === 'openrouter' ? (
            <div className="space-y-2">
              <Select value={modelId} onValueChange={setModelId}>
                <SelectTrigger><SelectValue placeholder="Выберите OpenRouter модель" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="deepseek/deepseek-chat">DeepSeek V3 (Top Value 🔥)</SelectItem>
                  <SelectItem value="deepseek/deepseek-r1">DeepSeek R1 (Reasoning)</SelectItem>
                  <SelectItem value="qwen/qwen-2.5-72b-instruct">Qwen 2.5 72B (Best Open Source)</SelectItem>
                  <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                  <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free Tier)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          <div className="flex gap-2">
            <Input
              placeholder="Или введите ID вручную..."
              value={modelId}
              onChange={e => setModelId(e.target.value)}
            />
            {provider === 'google' && (
              <Button variant="outline" size="sm" onClick={async () => {
                const { googleApiKey } = useAIStore.getState()
                if (!googleApiKey) return toast.error('Сначала введите API Key')
                try {
                  toast.info('Запрашиваем список моделей...')
                  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${googleApiKey}`)
                  const data = await res.json()
                  if (data.models) {
                    console.log('Available models:', data.models)
                    toast.success(`Найдено ${data.models.length} моделей (см. консоль)`)
                    // Auto-pick flash if available
                    const flash = data.models.find((m: any) => m.name.includes('flash') && !m.name.includes('exp'))
                    if (flash) {
                      const cleanName = flash.name.replace('models/', '')
                      setModelId(cleanName)
                      toast.success(`Автовыбор: ${cleanName}`)
                    }
                  } else {
                    toast.error('Не удалось получить список: ' + JSON.stringify(data))
                  }
                } catch (e) {
                  toast.error('Ошибка запроса: ' + e)
                }
              }}>
                🔍 Проверить доступные
              </Button>
            )}
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            Модель должна поддерживать метод `generateContent`
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AssignmentSection() {
  const { models, configuredModels, setModel } = useAIStore()

  const features: { id: AIFeature; label: string }[] = [
    { id: 'default', label: 'По умолчанию' },
    { id: 'chat', label: 'Чат (Copilot)' },
    { id: 'analysis', label: 'Анализ данных' },
    { id: 'transcription', label: 'Транскрипция' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Назначение моделей</CardTitle>
        <CardDescription>
          Выберите, какая модель будет использоваться для каждой функции
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {features.map((feature) => (
          <div key={feature.id} className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 border-b last:border-0 pb-4 last:pb-0">
            <div className="font-medium">{feature.label}</div>
            <div className="md:col-span-2">
              <Select
                value={models[feature.id]}
                onValueChange={(val) => setModel(feature.id, val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите модель..." />
                </SelectTrigger>
                <SelectContent>
                  {configuredModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.provider}/{m.modelId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
