import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Hash, Flag, Clock, MoreHorizontal, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FeatureCardProps {
    title: string
    description?: string
    priority?: 'low' | 'medium' | 'high' | 'critical'
    status?: string
    tags?: string[]
    estimate?: string
    onClick?: () => void
    onAction?: () => void
    className?: string
}

const priorityConfig = {
    low: { label: 'Низкий', variant: 'secondary' as const, color: 'text-blue-500 bg-blue-500/10' },
    medium: { label: 'Средний', variant: 'default' as const, color: 'text-yellow-600 bg-yellow-500/10' },
    high: { label: 'Высокий', variant: 'default' as const, color: 'text-orange-600 bg-orange-500/10' },
    critical: { label: 'Критично', variant: 'destructive' as const, color: 'text-destructive bg-destructive/10' }
}

export function FeatureCard({
    title,
    description,
    priority = 'medium',
    status,
    tags = [],
    estimate,
    onClick,
    onAction,
    className
}: FeatureCardProps) {
    const pConfig = priorityConfig[priority] || priorityConfig.medium

    return (
        <Card
            className={cn(
                "group relative hover:border-primary/40 transition-all cursor-pointer bg-card shadow-sm select-none border-muted/50",
                className
            )}
            onClick={onClick}
        >
            <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Badge
                        variant="secondary"
                        className={cn("text-[10px] px-1 py-0 h-4 border-none font-bold uppercase tracking-wider", pConfig.color)}
                    >
                        {pConfig.label}
                    </Badge>
                    {status && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 font-medium opacity-70">
                            {status}
                        </Badge>
                    )}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); onAction?.(); }}
                >
                    <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                </Button>
            </CardHeader>

            <CardContent className="p-3 pt-0 space-y-3">
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {title}
                    </h4>
                    {description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {tags.slice(0, 3).map((tag) => (
                        <div key={tag} className="flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-transparent hover:border-muted-foreground/20 transition-colors">
                            <Hash className="w-2 h-2 opacity-50" />
                            <span>{tag}</span>
                        </div>
                    ))}
                    {tags.length > 3 && (
                        <span className="text-[10px] text-muted-foreground font-medium pl-0.5">
                            +{tags.length - 3}
                        </span >
                    )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-muted/30">
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        {estimate && (
                            <div className="flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{estimate}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Flag className="w-2.5 h-2.5" />
                            <span>ID-402</span>
                        </div>
                    </div>

                    <ChevronRight className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </div>
            </CardContent>
        </Card>
    )
}
