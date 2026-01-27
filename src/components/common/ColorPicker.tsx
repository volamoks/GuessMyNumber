import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Check, Pipette } from 'lucide-react'

interface ColorPickerProps {
    value: string
    onChange: (value: string) => void
    presets?: string[]
    className?: string
}

const DEFAULT_PRESETS = [
    '#000000', '#ffffff', '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
    '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
    '#795548', '#9e9e9e', '#607d8b'
]

export function ColorPicker({
    value,
    onChange,
    presets = DEFAULT_PRESETS,
    className
}: ColorPickerProps) {
    const [inputValue, setInputValue] = React.useState(value)

    React.useEffect(() => {
        setInputValue(value)
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)
        if (/^#[0-9A-F]{6}$/i.test(newValue)) {
            onChange(newValue)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn('w-full justify-start text-left font-normal h-10 px-3', className)}
                >
                    <div className="flex items-center gap-2 w-full">
                        <div
                            className="h-4 w-4 rounded border shadow-sm shrink-0"
                            style={{ backgroundColor: value }}
                        />
                        <span className="truncate flex-1 font-mono uppercase text-xs">
                            {value}
                        </span>
                        <Pipette className="h-3 w-3 text-muted-foreground" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
                <div className="space-y-3">
                    <div className="grid grid-cols-7 gap-1">
                        {presets.map((color) => (
                            <button
                                key={color}
                                className={cn(
                                    'h-6 w-6 rounded-md border border-muted hover:scale-110 transition-transform relative flex items-center justify-center',
                                    color === value && 'ring-2 ring-primary ring-offset-1'
                                )}
                                style={{ backgroundColor: color }}
                                onClick={() => onChange(color)}
                                title={color}
                            >
                                {color.toLowerCase() === value.toLowerCase() && (
                                    <Check className={cn(
                                        'h-3 w-3',
                                        ['#ffffff', '#ffeb3b', '#cddc39'].includes(color.toLowerCase()) ? 'text-black' : 'text-white'
                                    )} />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 items-center pt-2 border-t">
                        <div
                            className="h-8 w-8 rounded border shrink-0"
                            style={{ backgroundColor: value }}
                        />
                        <Input
                            value={inputValue}
                            onChange={handleInputChange}
                            className="h-8 text-xs font-mono uppercase"
                            placeholder="#000000"
                            maxLength={7}
                        />
                        <input
                            type="color"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="absolute opacity-0 w-0 h-0"
                            id="native-color-picker"
                        />
                        <label
                            htmlFor="native-color-picker"
                            className="h-8 w-8 flex items-center justify-center border rounded cursor-pointer hover:bg-muted"
                        >
                            <Pipette className="h-4 w-4" />
                        </label>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
