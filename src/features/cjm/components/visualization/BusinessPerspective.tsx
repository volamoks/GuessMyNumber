import { TrendingUp, BarChart3, Users, Shield, Cpu } from 'lucide-react'
import { StickyNotesList } from '@/components/shared/StickyNotesList'
import { EditableText } from '@/components/shared/EditableText'
import type { CJMStage } from '../../types'

interface BusinessPerspectiveProps {
    stage: CJMStage
    onUpdate: (field: keyof CJMStage, value: string | string[]) => void
}

export function BusinessPerspective({ stage, onUpdate }: BusinessPerspectiveProps) {
    return (
        <div className="grid md:grid-cols-2 gap-4 p-4">
            <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 font-medium text-warning">
                    <TrendingUp className="h-4 w-4" />
                    Business Goal
                </div>
                <div className="text-sm bg-warning/10 p-3 rounded-lg border border-warning/30">
                    <EditableText
                        text={stage.businessGoal}
                        onChange={(text) => onUpdate('businessGoal', text)}
                        placeholder="Business goal..."
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400">
                    <BarChart3 className="h-4 w-4" />
                    KPIs
                </div>
                <StickyNotesList
                    items={stage.kpis}
                    onChange={(items) => onUpdate('kpis', items)}
                    colorScheme="orange"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400">
                    <Users className="h-4 w-4" />
                    Organizational Activities
                </div>
                <StickyNotesList
                    items={stage.organizationalActivities}
                    onChange={(items) => onUpdate('organizationalActivities', items)}
                    colorScheme="orange"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400">
                    <Shield className="h-4 w-4" />
                    Responsibility
                </div>
                <StickyNotesList
                    items={stage.responsibility}
                    onChange={(items) => onUpdate('responsibility', items)}
                    colorScheme="orange"
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium text-orange-700 dark:text-orange-400">
                    <Cpu className="h-4 w-4" />
                    Technology Systems
                </div>
                <StickyNotesList
                    items={stage.technologySystems}
                    onChange={(items) => onUpdate('technologySystems', items)}
                    colorScheme="orange"
                />
            </div>
        </div>
    )
}
