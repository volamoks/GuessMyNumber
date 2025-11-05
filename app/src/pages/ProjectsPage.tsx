import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { projectsService, type Project, type ProjectType } from '@/lib/projects-service'
import { FileText, Calendar, Archive, Copy, Trash2, Search, RotateCcw } from 'lucide-react'

export function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProjects()
  }, [showArchived])

  useEffect(() => {
    filterProjects()
  }, [projects, searchQuery, typeFilter])

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const data = await projectsService.getProjects(undefined, showArchived)
      setProjects(data)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterProjects = () => {
    let filtered = projects

    if (typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredProjects(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) return

    const success = await projectsService.deleteProject(id)
    if (success) {
      await loadProjects()
    }
  }

  const handleArchive = async (id: string) => {
    await projectsService.archiveProject(id)
    await loadProjects()
  }

  const handleUnarchive = async (id: string) => {
    await projectsService.unarchiveProject(id)
    await loadProjects()
  }

  const handleDuplicate = async (id: string) => {
    try {
      await projectsService.duplicateProject(id)
      await loadProjects()
    } catch (error) {
      alert('Ошибка при дублировании проекта')
    }
  }

  const handleOpenProject = (project: Project) => {
    // Переходим на соответствующую страницу с параметром projectId
    const routes: Record<ProjectType, string> = {
      cjm: '/cjm',
      business_canvas: '/business-canvas',
      lean_canvas: '/lean-canvas',
    }
    navigate(`${routes[project.type]}?projectId=${project.id}`)
  }

  const getTypeLabel = (type: ProjectType): string => {
    const labels: Record<ProjectType, string> = {
      cjm: 'Customer Journey Map',
      business_canvas: 'Business Model Canvas',
      lean_canvas: 'Lean Canvas',
    }
    return labels[type]
  }

  const getTypeColor = (type: ProjectType): string => {
    const colors: Record<ProjectType, string> = {
      cjm: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      business_canvas: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      lean_canvas: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    }
    return colors[type]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Мои проекты</h1>
        <p className="text-muted-foreground">
          Все ваши сохранённые Customer Journey Maps и Business Canvases
        </p>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as ProjectType | 'all')}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="cjm">Customer Journey Map</SelectItem>
                <SelectItem value="business_canvas">Business Canvas</SelectItem>
                <SelectItem value="lean_canvas">Lean Canvas</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="mr-2 h-4 w-4" />
              {showArchived ? 'Все проекты' : 'Архивные'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Список проектов */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Загрузка проектов...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">Проекты не найдены</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery || typeFilter !== 'all'
                ? 'Попробуйте изменить фильтры'
                : 'Создайте свой первый проект'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleOpenProject(project)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(project.type)}`}>
                      {getTypeLabel(project.type)}
                    </span>
                    {project.is_archived && (
                      <span className="ml-2 text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-800">
                        Архив
                      </span>
                    )}
                  </div>
                </div>
                <CardTitle className="mt-2">{project.title}</CardTitle>
                {project.description && (
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <Calendar className="mr-2 h-4 w-4" />
                  {formatDate(project.updated_at)}
                </div>

                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicate(project.id)}
                    title="Дублировать"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>

                  {project.is_archived ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnarchive(project.id)}
                      title="Восстановить"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleArchive(project.id)}
                      title="В архив"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 hover:text-red-700"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
