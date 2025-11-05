import { Outlet, Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Map, LayoutGrid, Lightbulb, Settings, FolderKanban } from 'lucide-react'
import { FloatingAIGenerator } from '@/components/shared/FloatingAIGenerator'

const navigation = [
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Customer Journey Map', href: '/cjm', icon: Map },
  { name: 'Business Canvas', href: '/business-canvas', icon: LayoutGrid },
  { name: 'Lean Canvas', href: '/lean-canvas', icon: Lightbulb },
  { name: 'AI Settings', href: '/ai-settings', icon: Settings },
]

export function Layout() {
  const location = useLocation()

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
          <nav className="flex items-center space-x-6 text-sm font-medium">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Outlet />
      </main>

      {/* Floating AI Generator - context-aware */}
      <FloatingAIGenerator />
    </div>
  )
}
