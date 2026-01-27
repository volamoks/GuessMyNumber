import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Users, MoreVertical, Layout, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/date-formatters'

interface ProjectCardProps {
    title: string
    description?: string
    status?: 'active' | 'completed' | 'archived' | 'on-hold'
    progress?: number
    updatedAt?: string | Date
    memberCount?: number
    onEdit?: () => void
    onDelete?: () => void
    onClick?: () => void
    className?: string
}

const statusConfig = {
    active: { label: 'Активен', variant: 'default' as const, color: 'bg-green-500' },
    completed: { label: 'Завершен', variant: 'secondary' as const, color: 'bg-blue-500' },
    'on-hold': { label: 'Ожидание', variant: 'outline' as const, color: 'bg-yellow-500' },
    archived: { label: 'Архив', variant: 'destructive' as const, color: 'bg-gray-500' }
}

export function ProjectCard({
    title,
    description,
    status = 'active',
    progress = 0,
    updatedAt,
    memberCount = 0,
    onEdit,
    onDelete,
    onClick,
    className
}: ProjectCardProps) {
    const config = statusConfig[status] || statusConfig.active

    return (
        <Card
            className={cn(
                "group hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border-muted/60",
                className
            )}
            onClick={onClick}
        >
            <CardHeader className="pb-2 space-y-1">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 pr-4">
                        <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", config.color)} />
                            <Badge variant={config.variant} className="text-[10px] px-1.5 py-0 h-4">
                                {config.label}
                            </Badge>
                        </div>
                        <CardTitle className="text-base line-clamp-1 group-hover:text-primary transition-colors">
                            {title}
                        </CardTitle>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
                                Редактировать
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                            >
                                Удалить
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent className="pb-4 space-y-4">
                {description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {description}
                    </p>
                )}

                <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-medium">
                        <span className="text-muted-foreground">Прогресс</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1" />
                </div>
            </CardContent>

            <CardFooter className="pt-2 border-t bg-muted/5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{updatedAt ? formatDate(updatedAt) : '-'}</span>
                    </div>
                    {memberCount > 0 && (
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{memberCount}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <Layout className="w-3 h-3 mr-1" />
                    <span className="text-[10px] font-bold uppercase">Открыть</span>
                </div>
            </CardFooter>
        </Card>
    )
}
