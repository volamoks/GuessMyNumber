import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { PresentationSettings } from '../../types'
import type { SlideStyle } from '../../core/types/theme'

interface SlideTabProps {
    settings: PresentationSettings
    updateSlideStyle: (style: Partial<SlideStyle>) => void
}

export function SlideTab({ settings, updateSlideStyle }: SlideTabProps) {
    return (
        <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className="text-xs">Title Size: {settings.slideStyle.titleFontSize}pt</Label>
                    <Slider
                        value={[settings.slideStyle.titleFontSize]}
                        onValueChange={([value]) => updateSlideStyle({ titleFontSize: value })}
                        min={20}
                        max={60}
                        step={1}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label className="text-xs">Body Size: {settings.slideStyle.bodyFontSize}pt</Label>
                    <Slider
                        value={[settings.slideStyle.bodyFontSize]}
                        onValueChange={([value]) => updateSlideStyle({ bodyFontSize: value })}
                        min={10}
                        max={32}
                        step={1}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label className="text-xs">Code Size: {settings.slideStyle.codeFontSize}pt</Label>
                    <Slider
                        value={[settings.slideStyle.codeFontSize]}
                        onValueChange={([value]) => updateSlideStyle({ codeFontSize: value })}
                        min={8}
                        max={24}
                        step={1}
                        className="mt-2"
                    />
                </div>
                <div>
                    <Label className="text-xs">Padding: {settings.slideStyle.padding.toFixed(2)}"</Label>
                    <Slider
                        value={[settings.slideStyle.padding * 100]}
                        onValueChange={([value]) => updateSlideStyle({ padding: value / 100 })}
                        min={10}
                        max={100}
                        step={5}
                        className="mt-2"
                    />
                </div>
            </div>
        </div>
    )
}
