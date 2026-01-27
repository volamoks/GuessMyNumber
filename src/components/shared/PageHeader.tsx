import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
    title: string
    description?: string
    children?: ReactNode
    showBackButton?: boolean
    backTo?: string
}

export function PageHeader({
    title,
    description,
    children,
    showBackButton = false,
    backTo
}: PageHeaderProps) {
    const navigate = useNavigate()

    const handleBack = () => {
        if (backTo) {
            navigate(backTo)
        } else {
            navigate(-1)
        }
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b mb-6 bg-background/50 backdrop-blur-sm sticky top-0 z-30 pt-4 px-1">
            <div className="flex items-start gap-4">
                {showBackButton && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleBack}
                        className="mt-1 h-8 w-8 shrink-0"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                )}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-1 max-w-[600px] leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {children && (
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {children}
                </div>
            )}
        </div>
    )
}
