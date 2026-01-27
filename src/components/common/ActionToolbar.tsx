import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '../ui/separator'

interface ActionToolbarProps {
    children: ReactNode
    className?: string
    sticky?: boolean
}

interface ActionGroupProps {
    children: ReactNode
    className?: string
    label?: string
}

export function ActionToolbar({ children, className, sticky = true }: ActionToolbarProps) {
    return (
        <div className={cn(
            'flex items-center gap-2 p-2 bg-background/80 backdrop-blur-md border rounded-lg shadow-sm w-full overflow-x-auto no-scrollbar',
            sticky && 'sticky top-4 z-30 mb-6',
            className
        )}>
            {children}
        </div>
    )
}

export function ActionGroup({ children, className, label }: ActionGroupProps) {
    return (
        <div className={cn("group flex items-center gap-1.5 flex-shrink-0", className)}>
            {label && <span className="text-[10px] font-bold uppercase text-muted-foreground ml-1 mr-1">{label}</span>}
            {children}
            <Separator orientation="vertical" className="h-6 mx-1 group-last:hidden" />
        </div>
    )
}

/**
 * Empty spacer to push items to the right
 */
export function ActionToolbarSpacer() {
    return <div className="flex-1" />
}
