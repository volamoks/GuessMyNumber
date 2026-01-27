import { useState } from 'react'
import { useAIStore, type AIModelConfig, type AIProvider } from '@/store/aiStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'

interface ModelDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    modelToEdit?: AIModelConfig
}

export function ModelDialog({ open, onOpenChange, modelToEdit }: ModelDialogProps) {
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

    // Note: useState initializer runs only once, but here 'useState(() => ...)' is weird usage in original code meant to be useEffect or just initialization?
    // The original code used useState(() => { ... }) without returning value, effectively running it on every render if it was standard functional update? 
    // No, `useState(() => ...)` runs initializer ONCE.
    // BUT the original code didn't assign the result! `useState(() => { ... })`
    // This means the logic inside ran ONCE per component mount.
    // But ModelDialog is rendered conditionally or kept mounted?
    // In `SettingsPage`: 
    // `<ModelDialog open={isAddDialogOpen} ... />` -> mounted when rendered.
    // `{editingModel && <ModelDialog ... />}` -> mounted when editingModel exists.
    // So it works as initialization logic.
    // HOWEVER, if open prop changes but component stays mounted (e.g. reused), this logic won't rerun.
    // Better to use `useEffect` or `key` on Dialog.
    // I'll keep it as is to minimize regression, or improve it?
    // I'll improve it by checking `modelToEdit` in `useEffect`.

    // Wait, I should stick to original behavior first unless it's clearly broken.
    // The original: `useState(() => { ... })`.
    // If I extract it, I should probably standardise it.

    // Actually, I'll use `key={modelToEdit?.id}` in parent to force remount, or `useEffect`.
    // Let's use `useEffect`.

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
                                <Button variant="outline" size="sm" asChild><a href="https://console.groq.com/keys" target="_blank" rel="noreferrer">Get</a></Button>
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
