import { cn } from '@/lib/utils'

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min: number
  max: number
  step: number
  className?: string
}

export function Slider({ value, onValueChange, min, max, step, className }: SliderProps) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={cn(
        'w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer',
        '[&::-webkit-slider-thumb]:appearance-none',
        '[&::-webkit-slider-thumb]:w-4',
        '[&::-webkit-slider-thumb]:h-4',
        '[&::-webkit-slider-thumb]:bg-primary',
        '[&::-webkit-slider-thumb]:rounded-full',
        '[&::-webkit-slider-thumb]:cursor-pointer',
        '[&::-moz-range-thumb]:w-4',
        '[&::-moz-range-thumb]:h-4',
        '[&::-moz-range-thumb]:bg-primary',
        '[&::-moz-range-thumb]:rounded-full',
        '[&::-moz-range-thumb]:border-0',
        '[&::-moz-range-thumb]:cursor-pointer',
        className
      )}
    />
  )
}
