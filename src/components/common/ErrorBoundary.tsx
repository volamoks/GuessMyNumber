import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

interface Props {
    children?: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-4">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">Что-то пошло не так</h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Произошла ошибка при загрузке этого компонента. Попробуйте обновить страницу или вернуться позже.
                    </p>
                    <Button
                        onClick={() => this.setState({ hasError: false })}
                        variant="outline"
                        className="gap-2"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Попробовать снова
                    </Button>
                </div>
            )
        }

        return this.props.children
    }
}
