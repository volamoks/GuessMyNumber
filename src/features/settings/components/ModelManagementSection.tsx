import { useState } from 'react'
import { useAIStore, type AIModelConfig } from '@/store/aiStore'
import { toast } from 'sonner'
import { ModelDialog } from './ModelDialog'
import { ModelCard } from './ModelCard'

export function ModelManagementSection() {
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
