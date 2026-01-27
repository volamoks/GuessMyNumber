import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    subtitle?: string
    backHref?: string
    children?: ReactNode
    className?: string
}

export function PageHeader({
    title,
    subtitle,
    backHref,
    children,
    className
}: PageHeaderProps) {
    const navigate = useNavigate()

    return (
        <div className={cn('flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between', className)}>
            <div className="flex flex-col gap-2">
                {backHref && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="-ml-2 h-8 w-fit gap-1 text-muted-foreground"
                        onClick={() => navigate(backHref)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Назад
                    </Button>
                )}
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    {subtitle && (
                        <p className="text-muted-foreground">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {children && (
                <div className="flex items-center gap-2">
                    {children}
                </div>
            )}
        </div>
    )
}
