import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
    className?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    label?: string
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
}

export function LoadingSpinner({ className, size = 'md', label }: LoadingSpinnerProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
            <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
            {label && <p className="text-sm text-muted-foreground animate-pulse">{label}</p>}
        </div>
    )
}

export function LoadingPage() {
    return (
        <div className="flex h-[80vh] w-full items-center justify-center">
            <LoadingSpinner size="lg" label="Загрузка..." />
        </div>
    )
}
