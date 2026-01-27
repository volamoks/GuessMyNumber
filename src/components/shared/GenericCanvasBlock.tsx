import * as React from 'react'
import { EditableList } from '@/components/shared/EditableList'
import { EditableText } from '@/components/shared/EditableText'
import { cn } from '@/lib/utils'

export interface GenericCanvasBlockProps {
    title: string
    icon?: React.ReactNode
    accentColor?: string
    className?: string

    // Content Mode: List or Text
    items?: string[]
    onItemsChange?: (items: string[]) => void

    text?: string
    onTextChange?: (text: string) => void

    placeholder?: string

    // Style variant
    variant?: 'business' | 'lean' // 'business' = top border, 'lean' = left border (or unified?)
}

/**
 * A unified block component for Business Model and Lean Canvases.
 * Supports both list-based (default) and text-based content.
 * Implements the "2026 Standards" aesthetic with refined glass headers and interactions.
 */
export function GenericCanvasBlock({
    title,
    icon,
    accentColor = "border-blue-500",
    className,
    items,
    onItemsChange,
    text,
    onTextChange,
    placeholder = "Add item...",
    variant = 'business'
}: GenericCanvasBlockProps) {

    const isTextMode = text !== undefined && onTextChange !== undefined

    return (
        <div className={cn(
            "group relative flex flex-col h-full min-h-[220px] bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
            "border border-border/50", // Base subtle border
            variant === 'business' ? "rounded-xl border-t-[3px]" : "rounded-r-xl rounded-l-md border-l-[4px]",
            accentColor,
            className
        )}>
            {/* Header */}
            <div className="flex items-center gap-3 p-5 pb-3">
                <div className={cn(
                    "p-2 rounded-lg bg-muted/50 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:bg-muted group-hover:scale-110",
                    "ring-1 ring-inset ring-border/50"
                )}>
                    {React.isValidElement(icon)
                        ? React.cloneElement(icon as React.ReactElement<any>, { className: "h-4 w-4" })
                        : icon
                    }
                </div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors select-none">
                    {title}
                </h3>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 pb-5 pt-1">
                {isTextMode ? (
                    <EditableText
                        text={text}
                        onChange={onTextChange}
                        placeholder={placeholder}
                        className="text-sm leading-relaxed"
                    />
                ) : (
                    <EditableList
                        items={items || []}
                        onChange={onItemsChange || (() => { })}
                        placeholder={placeholder}
                    />
                )}
            </div>

            {/* Hover Gradient Overlay (Subtle) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-transparent to-muted/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
    )
}
