import { User, Target, Smartphone, Heart } from 'lucide-react'
import { StickyNotesList } from '@/components/shared/StickyNotesList'
import type { CJMStage } from '../../types'

interface CustomerPerspectiveProps {
    stage: CJMStage
    onUpdate: (field: keyof CJMStage, value: string[]) => void
}

export function CustomerPerspective({ stage, onUpdate }: CustomerPerspectiveProps) {
    return (
        <div className="grid md:grid-cols-2 gap-4 p-4">
            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400">
                    <User className="h-4 w-4" />
                    Customer Activities
                </div>
                <StickyNotesList
                    items={stage.customerActivities}
                    onChange={(items) => onUpdate('customerActivities', items)}
                    colorScheme="blue"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400">
                    <Target className="h-4 w-4" />
                    Customer Goals
                </div>
                <StickyNotesList
                    items={stage.customerGoals}
                    onChange={(items) => onUpdate('customerGoals', items)}
                    colorScheme="blue"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-purple-700 dark:text-purple-400">
                    <Smartphone className="h-4 w-4" />
                    Touchpoints
                </div>
                <StickyNotesList
                    items={stage.touchpoints}
                    onChange={(items) => onUpdate('touchpoints', items)}
                    colorScheme="purple"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-purple-700 dark:text-purple-400">
                    <Heart className="h-4 w-4" />
                    Experience
                </div>
                <StickyNotesList
                    items={stage.experience}
                    onChange={(items) => onUpdate('experience', items)}
                    colorScheme="purple"
                />
            </div>
        </div>
    )
}
