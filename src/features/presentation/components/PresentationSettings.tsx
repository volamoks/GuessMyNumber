import { useState } from 'react'
import { usePresentationStore } from '@/store'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RotateCcw, Upload, X, Type, Image as ImageIcon, User, Palette } from 'lucide-react'
import { DEFAULT_THEMES } from '@/features/presentation/types'
import { DEFAULT_SLIDE_STYLE } from '@/features/presentation/core/types/theme'
import { toast } from 'sonner'

export function PresentationSettings() {
  const { theme, settings, setTheme, updateSlideStyle, updateLogo, setSettings } =
    usePresentationStore()

  const [activeTab, setActiveTab] = useState('general')

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      updateLogo({ url, enabled: true })
      toast.success('Логотип загружен')
    }
    reader.readAsDataURL(file)
  }

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Пожалуйста, выберите изображение')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      setSettings({ backgroundImage: url })
      toast.success('Фон загружен')
    }
    reader.readAsDataURL(file)
  }

  const resetToDefaults = () => {
    updateSlideStyle(DEFAULT_SLIDE_STYLE)
    updateLogo({
      enabled: false,
      url: '',
      position: 'bottom-right',
      size: 1.0,
      opacity: 100,
    })
    setSettings({
      backgroundImage: undefined,
      backgroundOpacity: 100,
      layout: 'LAYOUT_16x9',
      fontFamily: 'Inter, sans-serif',
      author: '',
      company: ''
    })
    toast.success('Настройки сброшены')
  }

  return (
    <div className="space-y-4">
      <Tabs className="w-full" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">
            <User className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="design">
            <Palette className="w-4 h-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="slides">
            <Type className="w-4 h-4 mr-2" />
            Slides
          </TabsTrigger>
          <TabsTrigger value="branding">
            <ImageIcon className="w-4 h-4 mr-2" />
            Brand
          </TabsTrigger>
        </TabsList>

        {activeTab === 'general' && (
          <TabsContent value="general" className="space-y-4 mt-4">
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
          </TabsContent>
        )}

        {activeTab === 'design' && (
          <TabsContent value="design" className="space-y-4 mt-4">
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
          </TabsContent>
        )}

        {activeTab === 'slides' && (
          <TabsContent value="slides" className="space-y-4 mt-4">
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
          </TabsContent>
        )}

        {activeTab === 'branding' && (
          <TabsContent value="branding" className="space-y-4 mt-4">
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
          </TabsContent>
        )}
      </Tabs>

      <Button onClick={resetToDefaults} variant="outline" className="w-full mt-4">
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset to Defaults
      </Button>
    </div>
  )
}
