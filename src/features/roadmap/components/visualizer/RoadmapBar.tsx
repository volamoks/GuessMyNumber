import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RoadmapFeature } from '@/lib/schemas'
import type { SectionKey } from '../../hooks/useRoadmapDrag'

interface RoadmapBarProps {
    feature: RoadmapFeature
    section: SectionKey
    index: number
    position: { left: string, width: string }
    isDragging: boolean
    onDragStart: (
        e: React.MouseEvent,
        type: 'move' | 'resize-start' | 'resize-end',
        feature: RoadmapFeature,
        section: SectionKey,
        index: number
    ) => void
    onEdit: () => void
}

export function RoadmapBar({
    feature,
    section,
    index,
    position,
    isDragging,
    onDragStart,
    onEdit
}: RoadmapBarProps) {
    return (
        <div className="h-11 border-b border-transparent relative group hover:bg-muted/5 w-full">
            <div className="absolute inset-0 border-b opacity-50 pointer-events-none" />

            {/* Bar Wrapper */}
            <div className="relative w-full h-full">

                {/* THE BAR */}
                <div
                    className={cn(
                        "absolute top-2 h-7 rounded-sm shadow-sm border text-[10px] px-2 flex items-center transition-all overflow-hidden whitespace-nowrap bg-primary/90 text-primary-foreground z-10",
                        !feature.startDate && "border-dashed opacity-70 bg-muted text-muted-foreground",
                        // Dragging styles
                        isDragging ? "cursor-grabbing shadow-lg scale-[1.02] ring-2 ring-primary ring-offset-1 z-50" : "hover:shadow-md hover:scale-[1.01] hover:bg-primary cursor-grab"
                    )}
                    style={{
                        ...position,
                        minWidth: '24px'
                    }}
                    onMouseDown={(e) => onDragStart(e, 'move', feature, section, index)}
                    onDoubleClick={(e) => {
                        e.stopPropagation()
                        onEdit()
                    }}
                >

                    {/* Resize Handle LEFT */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-w-resize hover:bg-black/20 z-20"
                        onMouseDown={(e) => onDragStart(e, 'resize-start', feature, section, index)}
                    />

                    {/* Grip Icon (Visual only) */}
                    <GripVertical className="h-3 w-3 mr-1 opacity-50 flex-shrink-0" />

                    <span className="truncate font-medium mix-blend-difference text-white/90 pointer-events-none select-none">{feature.title}</span>

                    {/* Resize Handle RIGHT */}
                    <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-e-resize hover:bg-black/20 z-20"
                        onMouseDown={(e) => onDragStart(e, 'resize-end', feature, section, index)}
                    />
                </div>
            </div>
        </div>
    )
}
