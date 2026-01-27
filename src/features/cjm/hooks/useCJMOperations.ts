import type { CJMData, CJMStage } from '../types'

export function useCJMOperations(data: CJMData, onUpdate?: (data: CJMData) => void) {
    const handleUpdateStage = (stageIndex: number, field: keyof CJMStage, value: string | string[]) => {
        if (!onUpdate) return
        const newStages = [...data.stages]
        newStages[stageIndex] = { ...newStages[stageIndex], [field]: value } as CJMStage
        onUpdate({ ...data, stages: newStages })
    }

    return { handleUpdateStage }
}
