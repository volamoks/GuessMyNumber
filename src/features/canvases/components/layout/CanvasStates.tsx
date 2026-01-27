import { Button } from '@/components/ui/button'
import { History, Sparkles, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ProjectType } from '@/lib/projects-service'

export function CanvasLoadingState() {
    return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                </div>
            </div>
            <p className="text-muted-foreground animate-pulse">Loading project...</p>
        </div>
    )
}

interface CanvasErrorStateProps {
    error: string
    onRetry: () => void
}

export function CanvasErrorState({ error, onRetry }: CanvasErrorStateProps) {
    const navigate = useNavigate()
    return (
        <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="p-6 rounded-full bg-destructive/10 text-destructive mb-2">
                <History className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold">Unable to load project</h3>
            <p className="text-muted-foreground max-w-sm text-center">
                {error === 'Project not found' ? "We couldn't find this project." : "An error occurred while loading."}
            </p>
            <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => navigate('/projects')}>
                    Back to Projects
                </Button>
                <Button onClick={onRetry}>
                    Try Again
                </Button>
            </div>
        </div>
    )
}

interface CanvasEmptyStateProps {
    projectType: ProjectType
    onShowGenerator: () => void
    triggerImport: () => void
    loadExample: () => void
}

export function CanvasEmptyState({
    projectType,
    onShowGenerator,
    triggerImport,
    loadExample
}: CanvasEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="p-8 rounded-full bg-background border shadow-lg relative">
                    <Sparkles className="h-16 w-16 text-primary" />
                </div>
            </div>

            <div className="space-y-3 max-w-lg">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Create {projectType === 'cjm' ? 'Customer Journey' : 'New Project'}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    Start by importing existing data or let AI help you structure your ideas in seconds.
                </p>
            </div>

            <div className="flex gap-4 p-2 rounded-2xl bg-muted/30 backdrop-blur border">
                <Button onClick={onShowGenerator} size="lg" className="h-12 px-8 gap-2 shadow-md hover:shadow-lg transition-all rounded-xl">
                    <Sparkles className="h-5 w-5" />
                    Generate with AI
                </Button>
                <Button variant="outline" size="lg" onClick={triggerImport} className="h-12 px-8 gap-2 bg-background/50 hover:bg-background rounded-xl">
                    <Upload className="h-5 w-5" />
                    Import JSON
                </Button>
                <Button variant="ghost" size="lg" onClick={loadExample} className="h-12 px-6 rounded-xl hover:bg-muted/50">
                    Load Example
                </Button>
            </div>
        </div>
    )
}
