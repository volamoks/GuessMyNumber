import { useState } from 'react'
import { type AIModelConfig } from '@/store/aiStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Settings2, Trash2, Activity, Check, Play } from 'lucide-react'
import { checkConnection } from '@/lib/ai/vercel-ai'

interface ModelCardProps {
    model: AIModelConfig
    onDelete: () => void
    onEdit: () => void
}

export function ModelCard({ model, onDelete, onEdit }: ModelCardProps) {
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
