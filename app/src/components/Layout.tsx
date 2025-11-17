import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Map, LayoutGrid, Lightbulb, Settings, FolderKanban, Route, Moon, Sun, GanttChart, Presentation } from 'lucide-react'
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
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Layout() {
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <LayoutGrid className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">
                Product Tools
              </span>
            </Link>
          </div>
          <nav className="flex items-center space-x-6 text-sm font-medium flex-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center space-x-2 transition-colors hover:text-foreground/80',
                    isActive ? 'text-foreground' : 'text-foreground/60'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{item.name}</span>
                </Link>
              )
            })}
          </nav>
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

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
  )
}
