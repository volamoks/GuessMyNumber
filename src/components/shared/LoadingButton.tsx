/**
 * LoadingButton Component
 * Unified button component with loading state and icon support
 */

import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

export interface LoadingButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Button label text */
  label: string
  /** Loading state label (defaults to "${label}...") */
  loadingLabel?: string
  /** Icon component from lucide-react */
  icon?: LucideIcon
  /** Loading state */
  isLoading?: boolean
  /** Button variant */
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /** Additional className */
  className?: string
}

/**
 * LoadingButton - Reusable button with loading state
 *
 * @example
 * ```tsx
 * <LoadingButton
 *   label="Save"
 *   loadingLabel="Saving..."
 *   icon={Save}
 *   isLoading={isSaving}
 *   onClick={handleSave}
 *   variant="outline"
 *   size="sm"
 * />
 * ```
 */
export function LoadingButton({
  label,
  loadingLabel,
  icon: Icon,
  isLoading = false,
  variant = 'default',
  size = 'default',
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const displayLabel = isLoading && loadingLabel ? loadingLabel : label

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={className}
      {...props}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {displayLabel}
    </Button>
  )
}
