import { format, isSameMonth, isSameQuarter } from 'date-fns'
import type { ViewMode } from '../../hooks/useRoadmapTimeline'

interface TimelineHeaderProps {
    timeColumns: Date[]
    viewMode: ViewMode
}

export function TimelineHeader({ timeColumns, viewMode }: TimelineHeaderProps) {
    return (
        <div className="flex-none h-12 border-b bg-muted/30 flex items-center z-30">
            <div className="w-64 flex-shrink-0 border-r px-4 font-semibold text-sm text-muted-foreground bg-background/50 backdrop-blur sticky left-0 z-40 h-full flex items-center shadow-sm">
                Task Name
            </div>
            <div className="flex-1 relative h-full overflow-hidden">
                <div className="absolute inset-0 flex">
                    {timeColumns.map((date, i) => (
                        <div key={i} className="flex-1 border-r last:border-r-0 flex items-center justify-center text-xs font-medium text-muted-foreground uppercase tracking-wider relative group">
                            <span className={isSameMonth(date, new Date()) || (viewMode === 'quarters' && isSameQuarter(date, new Date())) ? "text-primary font-bold" : ""}>
                                {viewMode === 'quarters' ? `Q${Math.floor(date.getMonth() / 3) + 1} '${format(date, 'yy')}` : format(date, 'MMM yy')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
