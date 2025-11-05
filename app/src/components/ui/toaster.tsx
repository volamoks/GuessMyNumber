import { Toaster as Sonner } from 'sonner'
import { useThemeStore } from '@/store'

export function Toaster() {
  const { theme } = useThemeStore()

  return (
    <Sonner
      theme={theme === 'system' ? undefined : (theme as 'light' | 'dark')}
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        className: 'group',
        descriptionClassName: 'group-[.toast]:text-muted-foreground',
        actionButtonStyle: {
          background: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
        },
        cancelButtonStyle: {
          background: 'hsl(var(--muted))',
          color: 'hsl(var(--muted-foreground))',
        },
      }}
    />
  )
}
