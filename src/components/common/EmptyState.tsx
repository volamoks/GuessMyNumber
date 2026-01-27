import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
    title: string
    description?: string
    icon?: LucideIcon
    action?: {
        label: string
        onClick: () => void
    }
    className?: string
}

export function EmptyState({
    title,
    description,
    icon: Icon,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            'flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-muted p-8 text-center animate-in fade-in zoom-in-95 duration-300',
            className
        )}>
            {Icon && (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 mb-4">
                    <Icon className="h-10 w-10 text-muted-foreground/60" />
                </div>
            )}
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    {description}
                </p>
            )}
            {action && (
                <Button onClick={action.onClick} className="mt-6" variant="outline">
                    {action.label}
                </Button>
            )}
        </div>
    )
}
