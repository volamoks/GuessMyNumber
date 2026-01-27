import { ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react'
import { StickyNotesList } from '@/components/shared/StickyNotesList'
import type { CJMStage } from '../../types'

interface InsightsPerspectiveProps {
    stage: CJMStage
    onUpdate: (field: keyof CJMStage, value: string[]) => void
}

export function InsightsPerspective({ stage, onUpdate }: InsightsPerspectiveProps) {
    return (
        <div className="grid md:grid-cols-3 gap-4 p-4">
            <div className="space-y-3 p-4 rounded-lg">
                <div className="flex items-center gap-2 font-medium text-green-700 dark:text-green-400">
                    <ThumbsUp className="h-4 w-4" />
                    Positives
                </div>
                <StickyNotesList
                    items={stage.positives}
                    onChange={(items) => onUpdate('positives', items)}
                    colorScheme="green"
                />
            </div>

            <div className="space-y-3 p-4 rounded-lg">
                <div className="flex items-center gap-2 font-medium text-red-700 dark:text-red-400">
                    <ThumbsDown className="h-4 w-4" />
                    Negatives
                </div>
                <StickyNotesList
                    items={stage.negatives}
                    onChange={(items) => onUpdate('negatives', items)}
                    colorScheme="red"
                />
            </div>

            <div className="space-y-3 p-4 rounded-lg">
                <div className="flex items-center gap-2 font-medium text-yellow-700 dark:text-yellow-400">
                    <Lightbulb className="h-4 w-4" />
                    Ideas & Opportunities
                </div>
                <StickyNotesList
                    items={stage.ideasOpportunities}
                    onChange={(items) => onUpdate('ideasOpportunities', items)}
                    colorScheme="yellow"
                />
            </div>
        </div>
    )
}
