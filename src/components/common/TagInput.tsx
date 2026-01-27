import * as React from 'react'
import { X, Plus, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface TagInputProps {
    tags: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
    maxTags?: number
    className?: string
    tagVariant?: 'default' | 'secondary' | 'outline' | 'destructive'
}

export function TagInput({
    tags,
    onChange,
    placeholder = 'Добавить тег...',
    maxTags,
    className,
    tagVariant = 'secondary'
}: TagInputProps) {
    const [inputValue, setInputValue] = React.useState('')
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleAddTag = () => {
        const trimmedValue = inputValue.trim()
        if (trimmedValue && !tags.includes(trimmedValue)) {
            if (maxTags && tags.length >= maxTags) return
            onChange([...tags, trimmedValue])
            setInputValue('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            handleRemoveTag(tags.length - 1)
        }
    }

    const handleRemoveTag = (index: number) => {
        const newTags = [...tags]
        newTags.splice(index, 1)
        onChange(newTags)
    }

    return (
        <div className={cn(
            'flex flex-wrap items-center gap-2 p-1.5 min-h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            className
        )}>
            {tags.map((tag, index) => (
                <Badge
                    key={`${tag}-${index}`}
                    variant={tagVariant}
                    className="flex items-center gap-1 pr-1 h-7 animate-in fade-in zoom-in-95 duration-200"
                >
                    <Hash className="w-3 h-3 text-muted-foreground/60" />
                    <span>{tag}</span>
                    <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="rounded-full outline-none hover:bg-muted p-0.5"
                    >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove tag</span>
                    </button>
                </Badge>
            ))}

            <div className="flex-1 flex items-center min-w-[120px]">
                <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="h-7 border-none focus-visible:ring-0 focus-visible:ring-offset-0 px-1 py-0 bg-transparent"
                />
                {inputValue && (
                    <button
                        type="button"
                        onClick={handleAddTag}
                        className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                )}
            </div>

            {maxTags && (
                <div className="w-full pt-1 px-1 flex justify-end">
                    <span className={cn(
                        "text-[10px] tabular-nums",
                        tags.length >= maxTags ? "text-destructive font-medium" : "text-muted-foreground"
                    )}>
                        {tags.length} / {maxTags}
                    </span>
                </div>
            )}
        </div>
    )
}
