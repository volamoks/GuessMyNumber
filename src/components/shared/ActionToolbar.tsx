import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Download, Sparkles, Loader2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ActionToolbarProps {
    onImportJSON?: () => void
    onExportJSON?: () => void
    onExportPDF?: () => void
    onAiGenerate?: () => void
    isAiGenerating?: boolean
    isExporting?: boolean
    customActions?: ReactNode
}

export function ActionToolbar({
    onImportJSON,
    onExportJSON,
    onExportPDF,
    onAiGenerate,
    isAiGenerating = false,
    isExporting = false,
    customActions
}: ActionToolbarProps) {
    return (
        <div className="flex items-center gap-2 p-1 rounded-lg border bg-card/50 shadow-sm">
            {/* Import/Export Group */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-2">
                        <Upload className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Data</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    {onImportJSON && (
                        <DropdownMenuItem onClick={onImportJSON}>
                            <Upload className="mr-2 h-4 w-4" /> Import JSON
                        </DropdownMenuItem>
                    )}
                    {onExportJSON && (
                        <DropdownMenuItem onClick={onExportJSON}>
                            <Download className="mr-2 h-4 w-4" /> Export JSON
                        </DropdownMenuItem>
                    )}
                    {onExportPDF && (
                        <DropdownMenuItem onClick={onExportPDF} disabled={isExporting}>
                            <Download className="mr-2 h-4 w-4" />
                            {isExporting ? 'Exporting PDF...' : 'Export PDF'}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-4 bg-border mx-1" />

            {/* AI Actions */}
            {onAiGenerate && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAiGenerate}
                    disabled={isAiGenerating}
                    className={`h-8 gap-2 ${isAiGenerating ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
                >
                    {isAiGenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                    )}
                    <span className="hidden sm:inline">AI Assist</span>
                </Button>
            )}

            {/* Custom Actions Slot */}
            {customActions && (
                <>
                    <div className="w-px h-4 bg-border mx-1" />
                    {customActions}
                </>
            )}
        </div>
    )
}
