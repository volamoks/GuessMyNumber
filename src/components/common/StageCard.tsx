import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StageSection {
    title: string
    items: string[]
    icon?: LucideIcon
    color?: 'default' | 'blue' | 'green' | 'red' | 'yellow' | 'purple'
}

interface StageCardProps {
    title: string
    subtitle?: string
    sections: StageSection[]
    tags?: string[]
    className?: string
    variant?: 'default' | 'outline' | 'glass'
}

const colorMap = {
    default: "bg-muted/40 border-border text-foreground",
    blue: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400",
    green: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400",
    red: "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400",
    purple: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-400",
}

export function StageCard({
    title,
    subtitle,
    sections,
    tags = [],
    className,
    variant = 'default'
}: StageCardProps) {
    return (
        <Card className={cn(
            "flex-shrink-0 w-80 sm:w-96 transition-all duration-200 border-2",
            variant === 'glass' ? "bg-background/60 backdrop-blur-md border-muted/50" : "bg-card shadow-sm hover:shadow-md",
            className
        )}>
            <CardHeader className="pb-3 border-b-2 border-muted/30 mb-4 bg-muted/5">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-primary leading-tight">
                        {title}
                    </CardTitle>
                    {subtitle && (
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            {subtitle}
                        </p>
                    )}
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4 pb-6">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            {section.icon && (
                                <section.icon className={cn("w-3.5 h-3.5", colorMap[section.color || 'default'].split(' ')[2])} />
                            )}
                            <h4 className={cn(
                                "text-[11px] font-bold uppercase tracking-widest opacity-80",
                                colorMap[section.color || 'default'].split(' ')[2]
                            )}>
                                {section.title}
                            </h4>
                        </div>

                        <div className={cn(
                            "rounded-lg border p-3 text-sm",
                            colorMap[section.color || 'default']
                        )}>
                            {section.items.length > 0 ? (
                                <ul className="space-y-1.5">
                                    {section.items.map((item, i) => (
                                        <li key={i} className="flex items-start gap-2 leading-snug">
                                            <span className="text-[10px] mt-1.5 opacity-40">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-xs italic text-muted-foreground/60 py-1">Нет данных</p>
                            )}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
