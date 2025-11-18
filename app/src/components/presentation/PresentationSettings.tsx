import { usePresentationStore } from '@/store/presentationStore'
import { Card } from '@/components/ui/card'
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
import { RotateCcw } from 'lucide-react'
import { DEFAULT_THEMES } from '@/lib/presentation-types'
import { DEFAULT_SLIDE_STYLE } from '@/lib/presentation/types/theme'
import { toast } from 'sonner'

export function PresentationSettings() {
  const { theme, settings, setTheme, updateSlideStyle, updateLogo, setSettings } =
    usePresentationStore()

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
    setSettings({ backgroundImage: undefined, backgroundOpacity: 100 })
    toast.success('Настройки сброшены')
  }

  return (
    <div className="space-y-4">
      {/* Theme Selection */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Тема</h3>
        <Select value={theme.id} onValueChange={(id) => {
          const newTheme = DEFAULT_THEMES.find(t => t.id === id)
          if (newTheme) setTheme(newTheme)
        }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_THEMES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Font Sizes */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Размеры шрифтов</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Заголовок слайда: {settings.slideStyle.titleFontSize}pt</Label>
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
            <Label className="text-xs">Основной текст: {settings.slideStyle.bodyFontSize}pt</Label>
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
            <Label className="text-xs">Код: {settings.slideStyle.codeFontSize}pt</Label>
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
            <Label className="text-xs">Отступ: {settings.slideStyle.padding.toFixed(2)}"</Label>
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
      </Card>

      {/* Logo */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Логотип</h3>
          <Switch
            checked={settings.logo.enabled}
            onCheckedChange={(enabled: boolean) => updateLogo({ enabled })}
          />
        </div>

        {settings.logo.enabled && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="logo-upload" className="text-xs">Изображение</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="text-xs"
                />
                {settings.logo.url && (
                  <img
                    src={settings.logo.url}
                    alt="Logo preview"
                    className="h-8 w-8 object-contain border rounded"
                  />
                )}
              </div>
            </div>

            <div>
              <Label className="text-xs">Позиция</Label>
              <Select
                value={settings.logo.position}
                onValueChange={(value: typeof settings.logo.position) =>
                  updateLogo({ position: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Верх слева</SelectItem>
                  <SelectItem value="top-right">Верх справа</SelectItem>
                  <SelectItem value="bottom-left">Низ слева</SelectItem>
                  <SelectItem value="bottom-right">Низ справа</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Размер: {settings.logo.size.toFixed(1)}"</Label>
              <Slider
                value={[settings.logo.size * 10]}
                onValueChange={([value]) => updateLogo({ size: value / 10 })}
                min={5}
                max={30}
                step={1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-xs">Прозрачность: {settings.logo.opacity}%</Label>
              <Slider
                value={[settings.logo.opacity]}
                onValueChange={([value]) => updateLogo({ opacity: value })}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          </div>
        )}
      </Card>

      {/* Background */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Фон слайда</h3>
        <div className="space-y-3">
          <div>
            <Label htmlFor="bg-upload" className="text-xs">Изображение фона</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="bg-upload"
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="text-xs"
              />
              {settings.backgroundImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSettings({ backgroundImage: undefined })}
                >
                  Удалить
                </Button>
              )}
            </div>
            {settings.backgroundImage && (
              <img
                src={settings.backgroundImage}
                alt="Background preview"
                className="mt-2 h-16 w-full object-cover border rounded"
              />
            )}
          </div>

          {settings.backgroundImage && (
            <div>
              <Label className="text-xs">Прозрачность фона: {settings.backgroundOpacity}%</Label>
              <Slider
                value={[settings.backgroundOpacity]}
                onValueChange={([value]) => setSettings({ backgroundOpacity: value })}
                min={0}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Reset Button */}
      <Button onClick={resetToDefaults} variant="outline" className="w-full">
        <RotateCcw className="h-4 w-4 mr-2" />
        Сбросить к дефолтам
      </Button>
    </div>
  )
}
