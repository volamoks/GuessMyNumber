import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DEFAULT_THEMES } from '@/features/presentation/types'
import type { PresentationTheme, PresentationSettings } from '../../types'

interface DesignTabProps {
    theme: PresentationTheme
    settings: PresentationSettings
    setTheme: (theme: PresentationTheme) => void
    setSettings: (settings: Partial<PresentationSettings>) => void
}

export function DesignTab({ theme, settings, setTheme, setSettings }: DesignTabProps) {
    return (
        <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Theme</Label>
                    <Select value={theme.id} onValueChange={(id) => {
                        const newTheme = DEFAULT_THEMES.find(t => t.id === id)
                        if (newTheme) setTheme(newTheme)
                    }}>
                        <SelectTrigger className="h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {DEFAULT_THEMES.map((t) => (
                                <SelectItem key={t.id} value={t.id}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                                        {t.name}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-2">
                    <Label>Font Family</Label>
                    <Select
                        value={settings.fontFamily}
                        onValueChange={(val) => setSettings({ fontFamily: val })}
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                            <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                            <SelectItem value="Helvetica, sans-serif">Helvetica</SelectItem>
                            <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                            <SelectItem value="Courier New, monospace">Courier New</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
