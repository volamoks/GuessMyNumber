import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    startOfWeek,
    endOfWeek
} from "date-fns"
import { ru } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarProps {
    className?: string
    selected?: Date
    onSelect?: (date: Date | undefined) => void
}

export function Calendar({ className, selected, onSelect }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date())

    const days = React.useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
        return eachDayOfInterval({ start, end })
    }, [currentMonth])

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

    return (
        <div className={cn("p-3 w-[280px]", className)}>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium capitalize">
                    {format(currentMonth, "LLLL yyyy", { locale: ru })}
                </h4>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                    <div key={day} className="text-[0.8rem] text-muted-foreground text-center font-medium">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    const isSelected = selected && isSameDay(day, selected)
                    const isCurrentMonth = isSameMonth(day, currentMonth)

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onSelect?.(day)}
                            className={cn(
                                "h-8 w-8 p-0 font-normal text-sm rounded-md flex items-center justify-center transition-colors",
                                !isCurrentMonth && "text-muted-foreground/30",
                                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                !isSelected && isToday(day) && "bg-accent text-accent-foreground",
                                !isSelected && !isToday(day) && "hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            {format(day, "d")}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
