import { cn } from '@/lib/utils'
import type { RoadmapFeature } from '@/lib/schemas'
import type { SectionKey } from '../../hooks/useRoadmapDrag'

interface RoadmapSidebarProps {
    allItems: { feature: RoadmapFeature, section: SectionKey, index: number }[]
    onEdit: (item: { section: SectionKey, index: number, feature: RoadmapFeature }) => void
}

export function RoadmapSidebar({ allItems, onEdit }: RoadmapSidebarProps) {
    return (
        <div className="w-64 flex-shrink-0 border-r bg-background z-20 overflow-y-auto overflow-x-hidden relative shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] scrollbar-hide">
            <div className="min-h-full pb-8">
                <div className="h-0" />
                {allItems.map(({ feature, section, index }) => (
                    <div
                        key={`sidebar-${section}-${index}`}
                        className="h-11 border-b px-4 flex items-center justify-between text-sm hover:bg-muted/50 transition-colors cursor-pointer group"
                        onClick={() => onEdit({ section, index, feature })}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <span className={cn(
                                "w-1.5 h-1.5 rounded-full flex-shrink-0",
                                feature.priority === 'high' ? "bg-red-500" : feature.priority === 'medium' ? "bg-amber-500" : "bg-blue-500"
                            )} />
                            <span className="truncate font-medium group-hover:text-primary transition-colors">{feature.title}</span>
                            <span className="opacity-0 group-hover:opacity-50 ml-2 text-[10px] uppercase border px-1 rounded">Edit</span>
                        </div>
                    </div>
                ))}
                {allItems.length === 0 && <div className="p-4 text-xs text-muted-foreground">No tasks</div>}
            </div>
        </div>
    )
}
