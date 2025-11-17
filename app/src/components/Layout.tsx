import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Map, LayoutGrid, Lightbulb, Settings, FolderKanban, Route, Moon, Sun, GanttChart, Presentation, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/store'

const navigation = [
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Customer Journey Map', href: '/cjm', icon: Map },
  { name: 'Business Canvas', href: '/business-canvas', icon: LayoutGrid },
  { name: 'Lean Canvas', href: '/lean-canvas', icon: Lightbulb },
  { name: 'Roadmap', href: '/roadmap', icon: Route },
  { name: 'JIRA Gantt', href: '/gantt', icon: GanttChart },
  { name: 'Presentations', href: '/presentation', icon: Presentation },
  { name: 'Documentation', href: '/documentation', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Layout() {
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - full width wrapper */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <LayoutGrid className="h-6 w-6" />
            <span className="font-bold">Product Tools</span>
          </Link>
          <div className="flex-1" />
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

      {/* Main layout with sidebar */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-muted/30 flex-shrink-0">
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
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
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Footer - full width wrapper */}
      <footer className="border-t bg-muted/30">
        <div className="flex h-12 items-center justify-center px-6 text-sm text-muted-foreground">
          Product Tools © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
