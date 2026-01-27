import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { projectsService, type Project, type ProjectType } from '@/lib/projects-service'
import { FileText, Search, Archive, Target, LayoutGrid, FolderKanban } from 'lucide-react'
import { StatsCard } from '@/components/shared/StatsCard'
import { ProjectCard } from '@/components/shared/ProjectCard'
import { toast } from 'sonner' // Assuming sonner is used for notifications (saw it in package.json)

export function ProjectsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all')
  const [showArchived, setShowArchived] = useState(false)

  // Fetch Projects
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', { showArchived }],
    queryFn: () => projectsService.getProjects(undefined, showArchived),
  })

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Проект удален')
    },
    onError: () => toast.error('Ошибка при удалении проекта'),
  })

  const archiveMutation = useMutation({
    mutationFn: (id: string) => projectsService.archiveProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Проект архивирован')
    },
    onError: () => toast.error('Ошибка при архивации'),
  })

  const unarchiveMutation = useMutation({
    mutationFn: (id: string) => projectsService.unarchiveProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Проект восстановлен из архива')
    },
    onError: () => toast.error('Ошибка при восстановлении'),
  })

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => projectsService.duplicateProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Проект дублирован')
    },
    onError: () => toast.error('Ошибка при дублировании'),
  })

  // Filter Logic (Client-side)
  const filteredProjects = useMemo(() => {
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

    return filtered
  }, [projects, searchQuery, typeFilter])

  // Stats Calculation
  const stats = useMemo(() => {
    const total = projects.filter(p => !p.is_archived).length
    const cjmCount = projects.filter(p => p.type === 'cjm' && !p.is_archived).length
    const businessCanvasCount = projects.filter(p => p.type === 'business_canvas' && !p.is_archived).length
    const leanCanvasCount = projects.filter(p => p.type === 'lean_canvas' && !p.is_archived).length
    const roadmapCount = projects.filter(p => p.type === 'roadmap' && !p.is_archived).length

    return {
      total,
      cjm: cjmCount,
      businessCanvas: businessCanvasCount,
      leanCanvas: leanCanvasCount,
      roadmap: roadmapCount,
    }
  }, [projects])

  const handleDelete = (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот проект?')) return
    deleteMutation.mutate(id)
  }

  const handleArchive = (id: string) => {
    archiveMutation.mutate(id)
  }

  const handleUnarchive = (id: string) => {
    unarchiveMutation.mutate(id)
  }

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id)
  }

  const handleOpenProject = (project: Project) => {
    const routes: Record<ProjectType, string> = {
      cjm: '/cjm',
      business_canvas: '/business-canvas',
      lean_canvas: '/lean-canvas',
      roadmap: '/roadmap',
    }
    navigate(`${routes[project.type]}?projectId=${project.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Мои проекты
            </h1>
            <p className="text-muted-foreground mt-2">
              Все ваши сохранённые Customer Journey Maps и Business Canvases
            </p>
          </div>
          <div className="flex gap-2">
            <Select onValueChange={(value) => navigate(value)}>
              <SelectTrigger className="w-[180px] bg-primary text-primary-foreground hover:bg-primary/90 border-0">
                <SelectValue placeholder="+ Новый проект" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="/cjm">Customer Journey Map</SelectItem>
                <SelectItem value="/business-canvas">Business Model Canvas</SelectItem>
                <SelectItem value="/lean-canvas">Lean Canvas</SelectItem>
                <SelectItem value="/roadmap">Product Roadmap</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Всего проектов"
          value={stats.total}
          description="Активные проекты"
          icon={FolderKanban}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900"
        />
        <StatsCard
          title="CJM"
          value={stats.cjm}
          description="Customer Journey Maps"
          icon={Target}
          className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-900"
        />
        <StatsCard
          title="Business Canvas"
          value={stats.businessCanvas}
          description="Business Model Canvas"
          icon={LayoutGrid}
          className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900"
        />
        <StatsCard
          title="Lean Canvas"
          value={stats.leanCanvas}
          description="Lean Canvas"
          icon={FileText}
          className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-900"
        />
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Поиск и фильтры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val as ProjectType | 'all')}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                <SelectItem value="cjm">Customer Journey Map</SelectItem>
                <SelectItem value="business_canvas">Business Canvas</SelectItem>
                <SelectItem value="lean_canvas">Lean Canvas</SelectItem>
                <SelectItem value="roadmap">Product Roadmap</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showArchived ? "default" : "outline"}
              onClick={() => setShowArchived(!showArchived)}
              className="w-full sm:w-auto"
            >
              <Archive className="mr-2 h-4 w-4" />
              {showArchived ? 'Все проекты' : 'Архивные'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Загрузка проектов...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Проекты не найдены</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || typeFilter !== 'all'
                ? 'Попробуйте изменить фильтры или поиск'
                : 'Создайте свой первый проект на одной из страниц выше'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              type={project.type}
              description={project.description}
              createdAt={new Date(project.created_at)}
              updatedAt={new Date(project.updated_at)}
              onOpen={() => handleOpenProject(project)}
              onDuplicate={() => handleDuplicate(project.id)}
              onArchive={() => project.is_archived ? handleUnarchive(project.id) : handleArchive(project.id)}
              onDelete={() => handleDelete(project.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
