import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, RotateCcw, Clock, MoreVertical, Calendar as CalendarIcon, Search } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar-custom'
import type { SavedTranscription } from '../types'

interface HistorySidebarProps {
    transcriptions: SavedTranscription[]
    activeResultId?: string
    onSelect: (id: string) => void
    onDelete: (id: string) => void
}

export function HistorySidebar({ transcriptions, activeResultId, onSelect, onDelete }: HistorySidebarProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [dateFilter, setDateFilter] = useState<string>('') // YYYY-MM-DD

    // Filter and Sort
    const filteredTranscriptions = useMemo(() => {
        return transcriptions
            .filter(item => {
                const matchesSearch = item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
                const matchesDate = dateFilter
                    ? new Date(item.createdAt).toISOString().startsWith(dateFilter)
                    : true
                return matchesSearch && matchesDate
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }, [transcriptions, searchTerm, dateFilter])

    // Group by Date
    const groupedHistory = useMemo(() => {
        const groups: Record<string, SavedTranscription[]> = {
            'Сегодня': [],
            'Вчера': [],
            'На этой неделе': [],
            'Ранее': []
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const lastWeek = new Date(today)
        lastWeek.setDate(lastWeek.getDate() - 7)

        filteredTranscriptions.forEach(item => {
            const date = new Date(item.createdAt)
            date.setHours(0, 0, 0, 0)

            if (date.getTime() === today.getTime()) {
                groups['Сегодня'].push(item)
            } else if (date.getTime() === yesterday.getTime()) {
                groups['Вчера'].push(item)
            } else if (date > lastWeek) {
                groups['На этой неделе'].push(item)
            } else {
                groups['Ранее'].push(item)
            }
        })

        return groups
    }, [filteredTranscriptions])

    if (transcriptions.length === 0) {
        return (
            <div className="w-full lg:w-80 shrink-0 border-l pl-0 lg:pl-6 pt-6 lg:pt-0 text-center text-muted-foreground text-sm">
                История пуста
            </div>
        )
    }

    return (
        <div className="w-full lg:w-80 shrink-0 border-l pl-0 lg:pl-6 pt-6 lg:pt-0 flex flex-col h-full">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    История
                </div>
                <div className="flex items-center gap-1">
                    {/* Calendar Filter */}
                    {/* Calendar Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={dateFilter ? "default" : "ghost"} size="icon" className="h-8 w-8 relative">
                                <CalendarIcon className="w-4 h-4" />
                                {dateFilter && (
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                selected={dateFilter ? new Date(dateFilter) : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
                                        setDateFilter(offsetDate.toISOString().split('T')[0])
                                    } else {
                                        setDateFilter('')
                                    }
                                }}
                            />
                            {dateFilter && (
                                <div className="p-3 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDateFilter('')}
                                        className="w-full"
                                    >
                                        Сбросить фильтр
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
            </h3>

            {/* Search Input */}
            <div className="mb-4 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9"
                />
            </div>

            <div className="space-y-6 overflow-y-auto pr-2 pb-20 flex-1">
                {Object.entries(groupedHistory).map(([label, items]) => (
                    items.length > 0 && (
                        <div key={label}>
                            <h4 className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-background/95 backdrop-blur py-1 z-10 uppercase tracking-wider">
                                {label}
                            </h4>
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => onSelect(item.id)}
                                        className={cn(
                                            "group p-3 rounded-lg border text-left text-sm transition-all hover:shadow-md cursor-pointer relative",
                                            activeResultId === item.id
                                                ? "bg-primary/5 border-primary shadow-sm"
                                                : "hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="font-medium truncate pr-6 mb-1">{item.fileName}</div>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>{(item.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="absolute top-2 right-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="w-3 h-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => {
                                                        e.stopPropagation()
                                                        onSelect(item.id)
                                                    }}>
                                                        <RotateCcw className="w-3 h-3 mr-2" />
                                                        Открыть
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onDelete(item.id)
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3 mr-2" />
                                                        Удалить
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}

                {transcriptions.length > 0 && filteredTranscriptions.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-4">
                        Ничего не найдено
                    </div>
                )}
            </div>
        </div>
    )
}
