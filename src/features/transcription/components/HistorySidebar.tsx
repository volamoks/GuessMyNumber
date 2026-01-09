import { Button } from '@/components/ui/button'
import { Trash2, RotateCcw, Clock, MoreVertical } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { SavedTranscription } from '../types'

interface HistorySidebarProps {
    transcriptions: SavedTranscription[]
    activeResultId?: string
    onSelect: (id: string) => void
    onDelete: (id: string) => void
}

export function HistorySidebar({ transcriptions, activeResultId, onSelect, onDelete }: HistorySidebarProps) {
    if (transcriptions.length === 0) {
        return (
            <div className="w-full lg:w-80 shrink-0 border-l pl-0 lg:pl-6 pt-6 lg:pt-0 text-center text-muted-foreground text-sm">
                История пуста
            </div>
        )
    }

    return (
        <div className="w-full lg:w-80 shrink-0 border-l pl-0 lg:pl-6 pt-6 lg:pt-0 flex flex-col h-[calc(100vh-100px)]">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                История
            </h3>
            <div className="space-y-3 overflow-y-auto pr-2 pb-20 flex-1">
                {transcriptions.map((item) => (
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
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
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
}
