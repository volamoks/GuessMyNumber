import { useAIStore, type AIFeature } from '@/store/aiStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AssignmentSection() {
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
