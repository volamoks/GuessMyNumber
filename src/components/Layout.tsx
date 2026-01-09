import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Map, LayoutGrid, Lightbulb, Settings, FolderKanban, Route, Moon, Sun, GanttChart, Presentation, Menu, X, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store'

const navigation = [
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'CJM', href: '/cjm', icon: Map },
  { name: 'Business', href: '/business-canvas', icon: LayoutGrid },
  { name: 'Lean', href: '/lean-canvas', icon: Lightbulb },
  { name: 'Roadmap', href: '/roadmap', icon: Route },
  { name: 'Gantt', href: '/gantt', icon: GanttChart },
  { name: 'Slides', href: '/presentation', icon: Presentation },
  { name: 'Transcribe', href: '/transcription', icon: Mic },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Layout() {
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - full width wrapper */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link to="/" className="mr-6 flex items-center space-x-2">
            <LayoutGrid className="h-5 w-5" />
            <span className="font-bold hidden sm:inline">Product Tools</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-accent',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex-1 md:flex-none" />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-background border-r transform transition-transform duration-200 ease-in-out md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content - full width */}
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <Outlet />
      </main>

      {/* Footer - full width wrapper */}
      <footer className="border-t bg-muted/30">
        <div className="flex h-10 items-center justify-center px-6 text-xs text-muted-foreground">
          Product Tools © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
