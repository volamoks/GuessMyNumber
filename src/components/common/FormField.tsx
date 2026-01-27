import type { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormFieldProps {
    label?: string
    error?: string
    description?: string
    required?: boolean
    children: ReactNode
    className?: string
    id?: string
}

export function FormField({
    label,
    error,
    description,
    required,
    children,
    className,
    id
}: FormFieldProps) {
    return (
        <div className={cn('space-y-2', className)}>
            {label && (
                <Label
                    htmlFor={id}
                    className={cn(
                        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                        error && 'text-destructive'
                    )}
                >
                    {label}
                    {required && <span className="ml-1 text-destructive">*</span>}
                </Label>
            )}

            <div className="relative">
                {children}
            </div>

            {description && !error && (
                <p className="text-[0.8rem] text-muted-foreground">
                    {description}
                </p>
            )}

            {error && (
                <p className="text-[0.8rem] font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    )
}
