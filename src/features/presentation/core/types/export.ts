/**
 * Типы для экспорта презентаций
 */

import type { PresentationTheme, SlideStyle } from './theme'

export interface LogoSettings {
  enabled: boolean
  url: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  size: number // width in inches
  opacity: number // 0-100
}

export interface ExportOptions {
  title: string
  author?: string
  company?: string
  theme: PresentationTheme
  slideStyle?: SlideStyle

  // Размер слайдов
  slideSize?: SlideSize

  // Опции контента
  includeSlideNumbers?: boolean
  includeDate?: boolean
  includePageBreaks?: boolean

  // Настройки логотипа и фона
  logo?: LogoSettings
  backgroundImage?: string
  backgroundOpacity?: number // 0-100
  footer?: string
  showDate?: boolean
  dateFormat?: 'locale' | 'ISO' | 'US' | 'EU'
  datePosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
}

export type SlideSize = 'LAYOUT_16x9' | 'LAYOUT_16x10' | 'LAYOUT_4x3' | 'LAYOUT_WIDE'

export interface ExportResult {
  success: boolean
  fileName?: string
  error?: string
  blob?: Blob
}

export interface RenderContext {
  theme: PresentationTheme
  slideStyle: SlideStyle
  currentY: number
  slideWidth: number
  slideHeight: number
  contentWidth: number
}

export interface RenderResult {
  height: number // высота отрендеренного элемента в дюймах
}

// Позиция элемента на слайде
export interface ElementPosition {
  x: number | string
  y: number
  w: number | string
  h: number
}
