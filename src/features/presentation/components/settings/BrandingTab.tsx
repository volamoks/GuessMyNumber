import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Upload, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { PresentationSettings, LogoSettings } from '../../types'

interface BrandingTabProps {
    settings: PresentationSettings
    updateLogo: (logo: Partial<LogoSettings>) => void
    setSettings: (settings: Partial<PresentationSettings>) => void
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleBackgroundUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function BrandingTab({
    settings,
    updateLogo,
    setSettings,
    handleLogoUpload,
    handleBackgroundUpload
}: BrandingTabProps) {
    return (
        <div className="space-y-4 mt-4">
            <div className="grid gap-4">
                <div className="border rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="font-medium">Logo</Label>
                        <Switch
                            checked={settings.logo.enabled}
                            onCheckedChange={(enabled) => updateLogo({ enabled })}
                        />
                    </div>

                    {settings.logo.enabled && (
                        <div className="space-y-3 pt-2">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="text-xs pr-8 h-8"
                                    />
                                    <Upload className="w-3 h-3 absolute right-3 top-2.5 text-muted-foreground pointer-events-none" />
                                </div>
                                {settings.logo.url && (
                                    <div className="w-8 h-8 border rounded flex items-center justify-center bg-muted/50">
                                        <img
                                            src={settings.logo.url}
                                            alt="Logo"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label className="text-xs">Position</Label>
                                    <Select
                                        value={settings.logo.position}
                                        onValueChange={(value: any) => updateLogo({ position: value })}
                                    >
                                        <SelectTrigger className="h-8 mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="top-left">Top Left</SelectItem>
                                            <SelectItem value="top-right">Top Right</SelectItem>
                                            <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                            <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-xs">Size: {settings.logo.size}"</Label>
                                    <Slider
                                        value={[settings.logo.size * 10]}
                                        onValueChange={([value]) => updateLogo({ size: value / 10 })}
                                        min={5}
                                        max={30}
                                        step={1}
                                        className="mt-3"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border rounded-lg p-3 space-y-3">
                    <Label className="font-medium">Background</Label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleBackgroundUpload}
                                className="text-xs pr-8 h-8"
                            />
                            <Upload className="w-3 h-3 absolute right-3 top-2.5 text-muted-foreground pointer-events-none" />
                        </div>
                        {settings.backgroundImage && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setSettings({ backgroundImage: undefined })}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {settings.backgroundImage && (
                        <div className="space-y-2">
                            <img
                                src={settings.backgroundImage}
                                alt="Background"
                                className="h-20 w-full object-cover rounded border"
                            />
                            <div>
                                <Label className="text-xs">Opacity: {settings.backgroundOpacity}%</Label>
                                <Slider
                                    value={[settings.backgroundOpacity]}
                                    onValueChange={([value]) => setSettings({ backgroundOpacity: value })}
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
