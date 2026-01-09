import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Trello, KanbanSquare, Loader2 } from 'lucide-react'
import { jiraService } from '@/features/jira-gantt/services/jira-service'
import { projectsService } from '@/lib/projects-service'
import { toast } from 'sonner'

interface CrossModuleImporterProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImport: (markdown: string) => void
}

export function CrossModuleImporter({ open, onOpenChange, onImport }: CrossModuleImporterProps) {
    const [activeTab, setActiveTab] = useState('jira')
    const [isLoading, setIsLoading] = useState(false)
    const [jiraIssues, setJiraIssues] = useState<any[]>([])
    const [projects, setProjects] = useState<any[]>([])
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    // Fetch data when tab changes
    useEffect(() => {
        if (!open) return

        const fetchData = async () => {
            setIsLoading(true)
            try {
                if (activeTab === 'jira') {
                    // Check if connected
                    if (jiraService.getConfig()) {
                        // Fetch recent issues or active sprint
                        // For now, we'll fetch a simple query
                        const issues = await jiraService.fetchIssues({ jql: 'order by created DESC', maxResults: 20 })
                        setJiraIssues(issues)
                    }
                } else if (activeTab === 'projects') {
                    const projs = await projectsService.getProjects()
                    setProjects(projs)
                }
            } catch (error) {
                console.error('Failed to fetch data:', error)
                // toast.error('Failed to load data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [open, activeTab])

    const handleImport = () => {
        let markdown = ''

        if (activeTab === 'jira') {
            const selectedIssues = jiraIssues.filter(i => selectedItems.includes(i.key))
            if (selectedIssues.length > 0) {
                markdown += `# Jira Issues Report\n\n`
                selectedIssues.forEach(issue => {
                    markdown += `## ${issue.key}: ${issue.summary}\n\n`
                    markdown += `* **Status**: ${issue.status}\n`
                    markdown += `* **Assignee**: ${issue.assignee || 'Unassigned'}\n`
                    markdown += `* **Priority**: ${issue.priority}\n\n`
                    if (issue.description) {
                        markdown += `> ${issue.description.substring(0, 200)}${issue.description.length > 200 ? '...' : ''}\n\n`
                    }
                    markdown += `---\n\n`
                })
            }
        } else if (activeTab === 'projects') {
            const selectedProjects = projects.filter(p => selectedItems.includes(p.id))
            if (selectedProjects.length > 0) {
                markdown += `# Projects Overview\n\n`
                selectedProjects.forEach(project => {
                    markdown += `## ${project.title}\n\n`
                    markdown += `* **Type**: ${project.type}\n`
                    markdown += `* **Last Updated**: ${new Date(project.updated_at).toLocaleDateString()}\n\n`
                    if (project.description) {
                        markdown += `${project.description}\n\n`
                    }

                    // Try to extract some data based on type
                    if (project.data) {
                        markdown += `### Data Preview\n\n`
                        markdown += `\`\`\`json\n${JSON.stringify(project.data, null, 2).substring(0, 300)}...\n\`\`\`\n\n`
                    }
                    markdown += `---\n\n`
                })
            }
        }

        onImport(markdown)
        onOpenChange(false)
        setSelectedItems([])
        toast.success('Content imported successfully')
    }

    const toggleSelection = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Content</DialogTitle>
                    <DialogDescription>
                        Select items from other modules to import as slides.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger
                                value="jira"
                                className="flex items-center gap-2"
                            >
                                <Trello className="h-4 w-4" />
                                Jira Issues
                            </TabsTrigger>
                            <TabsTrigger
                                value="projects"
                                className="flex items-center gap-2"
                            >
                                <KanbanSquare className="h-4 w-4" />
                                Projects & Canvases
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="flex-1 min-h-0 mt-4 border rounded-md relative">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : null}

                        {activeTab === 'jira' && (
                            <ScrollArea className="h-[300px] p-4">
                                {jiraIssues.length === 0 && !isLoading ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        No issues found or not connected to Jira.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {jiraIssues.map(issue => (
                                            <div key={issue.key} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-md">
                                                <Checkbox
                                                    id={issue.key}
                                                    checked={selectedItems.includes(issue.key)}
                                                    onCheckedChange={() => toggleSelection(issue.key)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label htmlFor={issue.key} className="font-medium cursor-pointer">
                                                        {issue.key}: {issue.summary}
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        {issue.status} • {issue.assignee || 'Unassigned'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        )}

                        {activeTab === 'projects' && (
                            <ScrollArea className="h-[300px] p-4">
                                {projects.length === 0 && !isLoading ? (
                                    <div className="text-center text-muted-foreground py-8">
                                        No projects found.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {projects.map(project => (
                                            <div key={project.id} className="flex items-start space-x-3 p-2 hover:bg-muted/50 rounded-md">
                                                <Checkbox
                                                    id={project.id}
                                                    checked={selectedItems.includes(project.id)}
                                                    onCheckedChange={() => toggleSelection(project.id)}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <Label htmlFor={project.id} className="font-medium cursor-pointer">
                                                        {project.title}
                                                    </Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        {project.type} • {new Date(project.updated_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <div className="flex-1 text-sm text-muted-foreground flex items-center">
                        {selectedItems.length} items selected
                    </div>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleImport} disabled={selectedItems.length === 0}>
                        Import Selected
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
