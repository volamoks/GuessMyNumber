import {
    Timeline,
    TimelineItem,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
    TimelineTitle,
    TimelineDescription,
} from '@/components/ui/timeline'
import type { CJMData } from '../../types'

interface CJMTimelineProps {
    data: CJMData
    selectedStage: number
    setSelectedStage: (index: number) => void
}

export function CJMTimeline({ data, selectedStage, setSelectedStage }: CJMTimelineProps) {
    const getStageStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
        if (index < selectedStage) return 'completed'
        if (index === selectedStage) return 'current'
        return 'upcoming'
    }

    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-max px-4">
                <Timeline>
                    {data.stages.map((stage, index) => (
                        <TimelineItem
                            key={index}
                            status={getStageStatus(index)}
                            isLast={index === data.stages.length - 1}
                        >
                            {index < data.stages.length - 1 && (
                                <TimelineConnector status={getStageStatus(index)} />
                            )}

                            <div
                                className="cursor-pointer transition-transform hover:scale-110"
                                onClick={() => setSelectedStage(index)}
                            >
                                <TimelineDot status={getStageStatus(index)}>
                                    <div className="text-white font-bold text-sm">{index + 1}</div>
                                </TimelineDot>
                            </div>

                            <TimelineContent>
                                <TimelineTitle className="text-base">{stage.name}</TimelineTitle>
                                <TimelineDescription>
                                    {stage.customerGoals.length} goals
                                </TimelineDescription>
                            </TimelineContent>
                        </TimelineItem>
                    ))}
                </Timeline>
            </div>
        </div>
    )
}
