import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { PresentationSettings } from '../../types'

interface GeneralTabProps {
    settings: PresentationSettings
    setSettings: (settings: Partial<PresentationSettings>) => void
}

export function GeneralTab({ settings, setSettings }: GeneralTabProps) {
    return (
        <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Author</Label>
                    <Input
                        value={settings.author || ''}
                        onChange={(e) => setSettings({ author: e.target.value })}
                        placeholder="Author Name"
                        className="h-8"
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Company</Label>
                    <Input
                        value={settings.company || ''}
                        onChange={(e) => setSettings({ company: e.target.value })}
                        placeholder="Company Name"
                        className="h-8"
                    />
                </div>

                <div className="grid gap-2">
                    <Label>Slide Layout</Label>
                    <Select
                        value={settings.layout}
                        onValueChange={(val: any) => setSettings({ layout: val })}
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LAYOUT_16x9">16:9 Widescreen</SelectItem>
                            <SelectItem value="LAYOUT_16x10">16:10 Screen</SelectItem>
                            <SelectItem value="LAYOUT_4x3">4:3 Standard</SelectItem>
                            <SelectItem value="LAYOUT_WIDE">Wide (Custom)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Footer Text</Label>
                    <Input
                        value={settings.footer || ''}
                        onChange={(e) => setSettings({ footer: e.target.value })}
                        placeholder="Confidential"
                        className="h-8"
                    />
                </div>
            </div>

            <div className="border rounded-md p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Auto-Fit Content</Label>
                        <p className="text-xs text-muted-foreground">Scale text to fit slide (PDF/Preview only)</p>
                    </div>
                    <Switch
                        checked={settings.autoFit || false}
                        onCheckedChange={(checked) => setSettings({ autoFit: checked })}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Show Date on Slides</Label>
                    <Switch
                        checked={settings.showDate || false}
                        onCheckedChange={(checked) => setSettings({ showDate: checked })}
                    />
                </div>

                {settings.showDate && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                            <Label className="text-xs">Format</Label>
                            <Select
                                value={settings.dateFormat || 'locale'}
                                onValueChange={(val: any) => setSettings({ dateFormat: val })}
                            >
                                <SelectTrigger className="h-8 mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="locale">Locale Default</SelectItem>
                                    <SelectItem value="ISO">ISO (YYYY-MM-DD)</SelectItem>
                                    <SelectItem value="US">US (MM/DD/YYYY)</SelectItem>
                                    <SelectItem value="EU">EU (DD.MM.YYYY)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="text-xs">Position</Label>
                            <Select
                                value={settings.datePosition || 'bottom-left'}
                                onValueChange={(val: any) => setSettings({ datePosition: val })}
                            >
                                <SelectTrigger className="h-8 mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                                    <SelectItem value="top-left">Top Left</SelectItem>
                                    <SelectItem value="top-right">Top Right</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
