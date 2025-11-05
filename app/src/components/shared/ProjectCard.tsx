import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  MoreVertical,
  Calendar,
  Edit,
  Copy,
  Trash2,
  ExternalLink,
  FileJson,
  LayoutGrid,
  Target
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type ProjectType = 'cjm' | 'business_canvas' | 'lean_canvas'

interface ProjectCardProps {
  id: string
  title: string
  type: ProjectType
  description?: string
  createdAt: Date
  updatedAt: Date
  onOpen?: () => void
  onDuplicate?: () => void
  onArchive?: () => void
  onDelete?: () => void
  className?: string
}

const typeConfig = {
  cjm: {
    label: 'Customer Journey Map',
    icon: Target,
    color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900',
    badgeVariant: 'default' as const,
  },
  business_canvas: {
    label: 'Business Canvas',
    icon: LayoutGrid,
    color: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900',
    badgeVariant: 'secondary' as const,
  },
  lean_canvas: {
    label: 'Lean Canvas',
    icon: FileJson,
    color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900',
    badgeVariant: 'outline' as const,
  },
}

export function ProjectCard({
  title,
  type,
  description,
  createdAt,
  updatedAt,
  onOpen,
  onDuplicate,
  onArchive,
  onDelete,
  className,
}: ProjectCardProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)
  }

  return (
    <Card className={cn('group overflow-hidden transition-all hover:shadow-md hover:border-primary/50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className={cn('rounded-lg p-2 border', config.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onOpen && (
                <DropdownMenuItem onClick={onOpen}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Открыть
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Редактировать
              </DropdownMenuItem>
              {onDuplicate && (
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Дублировать
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onArchive && (
                <DropdownMenuItem onClick={onArchive}>
                  Архивировать
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="space-y-1">
          <CardTitle className="text-lg line-clamp-1">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={config.badgeVariant} className="text-xs">
              {config.label}
            </Badge>
          </div>
        </div>
        {description && (
          <CardDescription className="line-clamp-2 text-sm">
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardFooter className="pt-0 flex-col items-start gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Создано: {formatDate(createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Edit className="h-3.5 w-3.5" />
          <span>Изменено: {formatDate(updatedAt)}</span>
        </div>
      </CardFooter>

      {onOpen && (
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </Card>
  )
}
