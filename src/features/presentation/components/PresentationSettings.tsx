import { useState } from 'react'
import { usePresentationStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RotateCcw, Type, Image as ImageIcon, User, Palette } from 'lucide-react'
import { DEFAULT_SLIDE_STYLE } from '@/features/presentation/core/types/theme'
import { toast } from 'sonner'

import { GeneralTab } from './settings/GeneralTab'
import { DesignTab } from './settings/DesignTab'
import { SlideTab } from './settings/SlideTab'
import { BrandingTab } from './settings/BrandingTab'

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
          <GeneralTab settings={settings} setSettings={setSettings} />
        )}

        {activeTab === 'design' && (
          <DesignTab
            theme={theme}
            settings={settings}
            setTheme={setTheme}
            setSettings={setSettings}
          />
        )}

        {activeTab === 'slides' && (
          <SlideTab settings={settings} updateSlideStyle={updateSlideStyle} />
        )}

        {activeTab === 'branding' && (
          <BrandingTab
            settings={settings}
            updateLogo={updateLogo}
            setSettings={setSettings}
            handleLogoUpload={handleLogoUpload}
            handleBackgroundUpload={handleBackgroundUpload}
          />
        )}
      </Tabs>

      <Button onClick={resetToDefaults} variant="outline" className="w-full mt-4">
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset to Defaults
      </Button>
    </div>
  )
}
