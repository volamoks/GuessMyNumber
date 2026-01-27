import { format, addMonths } from 'date-fns'
import { toast } from 'sonner'
import type { RoadmapData, RoadmapFeature } from '@/lib/schemas'
import type { SectionKey } from './useRoadmapDrag'

export function useRoadmapOperations(data: RoadmapData, onUpdate: (data: RoadmapData) => void) {
    const handleUpdateFeature = (section: SectionKey, index: number, updatedFeature: RoadmapFeature) => {
        const newData = { ...data }
        newData[section] = [...(newData[section] || [])]
        newData[section][index] = updatedFeature
        onUpdate(newData)
        toast.success('Feature updated')
    }

    const handleDeleteFeature = (section: SectionKey, index: number) => {
        if (!confirm('Delete this feature?')) return
        const newData = { ...data }
        newData[section] = (newData[section] || []).filter((_, i) => i !== index)
        onUpdate(newData)
        toast.success('Feature deleted')
    }

    const handleAddFeature = () => {
        const newData = { ...data }
        const newFeature: RoadmapFeature = {
            title: 'New Task',
            description: '',
            priority: 'medium',
            status: 'planning',
            category: 'feature',
            effort: 'medium',
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd')
        }
        newData['now'] = [...(newData['now'] || []), newFeature]
        onUpdate(newData)
        toast.success('New task added')
    }

    return {
        handleUpdateFeature,
        handleDeleteFeature,
        handleAddFeature
    }
}
