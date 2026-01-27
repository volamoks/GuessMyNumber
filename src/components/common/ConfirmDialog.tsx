import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: () => void
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'default' | 'destructive'
    isLoading?: boolean
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmLabel = 'Подтвердить',
    cancelLabel = 'Отмена',
    variant = 'default',
    isLoading = false
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={onConfirm}
                        loading={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
