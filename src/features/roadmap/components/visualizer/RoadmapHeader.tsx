import { Target, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RoadmapData } from '@/lib/schemas'
import type { ViewMode } from '../../hooks/useRoadmapTimeline'

interface RoadmapHeaderProps {
    data: RoadmapData
    viewMode: ViewMode
    setViewMode: (mode: ViewMode) => void
    scrollToToday: () => void
    handleAddFeature: () => void
}

export function RoadmapHeader({
    data,
    viewMode,
    setViewMode,
    scrollToToday,
    handleAddFeature
}: RoadmapHeaderProps) {
    return (
        <div className="flex-none px-1 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{data.title}</h2>
                {data.description && <p className="text-muted-foreground">{data.description}</p>}
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border">
                    <Button
                        variant={viewMode === 'months' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setViewMode('months')}
                    >
                        Months
                    </Button>
                    <Button
                        variant={viewMode === 'quarters' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setViewMode('quarters')}
                    >
                        Quarters
                    </Button>
                </div>

                <Button variant="outline" size="sm" onClick={scrollToToday} title="Go to Today">
                    <Target className="h-4 w-4 mr-2" /> Today
                </Button>

                <Button onClick={handleAddFeature} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
            </div>
        </div>
    )
}
