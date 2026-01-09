import { supabase } from './supabase'

export type ProjectType = 'cjm' | 'business_canvas' | 'lean_canvas' | 'roadmap'

export interface Project {
  id: string
  title: string
  type: ProjectType
  description?: string
  data: any
  created_at: string
  updated_at: string
  user_id?: string
  tags?: string[]
  is_archived: boolean
}

export interface ProjectVersion {
  id: string
  project_id: string
  version_number: number
  title: string
  data: any
  change_description?: string
  created_at: string
  created_by?: string
}

class ProjectsService {
  // ========== ПРОЕКТЫ ==========

  async createProject(
    title: string,
    type: ProjectType,
    data: any,
    description?: string,
    tags?: string[]
  ): Promise<Project | null> {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title,
        type,
        data,
        description,
        tags,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating project:', error)
      throw new Error(error.message)
    }

    return project
  }

  async updateProject(
    id: string,
    updates: {
      title?: string
      data?: any
      description?: string
      tags?: string[]
    }
  ): Promise<Project | null> {
    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      throw new Error(error.message)
    }

    return project
  }

  async getProject(id: string): Promise<Project | null> {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching project:', error)
      return null
    }

    return project
  }

  async getProjects(
    type?: ProjectType,
    includeArchived = false
  ): Promise<Project[]> {
    let query = supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    if (!includeArchived) {
      query = query.eq('is_archived', false)
    }

    const { data: projects, error } = await query

    if (error) {
      console.error('Error fetching projects:', error)
      return []
    }

    return projects || []
  }

  async deleteProject(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting project:', error)
      return false
    }

    return true
  }

  async archiveProject(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .update({ is_archived: true })
      .eq('id', id)

    if (error) {
      console.error('Error archiving project:', error)
      return false
    }

    return true
  }

  async unarchiveProject(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('projects')
      .update({ is_archived: false })
      .eq('id', id)

    if (error) {
      console.error('Error unarchiving project:', error)
      return false
    }

    return true
  }

  async duplicateProject(id: string, newTitle?: string): Promise<Project | null> {
    const original = await this.getProject(id)
    if (!original) return null

    const { data: duplicate, error } = await supabase
      .from('projects')
      .insert({
        title: newTitle || `${original.title} (Copy)`,
        type: original.type,
        data: original.data,
        description: original.description,
        tags: original.tags,
      })
      .select()
      .single()

    if (error) {
      console.error('Error duplicating project:', error)
      throw new Error(error.message)
    }

    return duplicate
  }

  // ========== ВЕРСИИ ==========

  async getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
    const { data: versions, error } = await supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', projectId)
      .order('version_number', { ascending: false })

    if (error) {
      console.error('Error fetching versions:', error)
      return []
    }

    return versions || []
  }

  async createVersion(
    projectId: string,
    changeDescription?: string
  ): Promise<ProjectVersion | null> {
    const project = await this.getProject(projectId)
    if (!project) return null

    // Получаем следующий номер версии
    const versions = await this.getProjectVersions(projectId)
    const nextVersionNumber = versions.length > 0 ? versions[0].version_number + 1 : 1

    const { data: version, error } = await supabase
      .from('project_versions')
      .insert({
        project_id: projectId,
        version_number: nextVersionNumber,
        title: project.title,
        data: project.data,
        change_description: changeDescription || 'Manual save',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating version:', error)
      throw new Error(error.message)
    }

    return version
  }

  async restoreVersion(projectId: string, versionNumber: number): Promise<Project | null> {
    const { data: version, error: versionError } = await supabase
      .from('project_versions')
      .select('*')
      .eq('project_id', projectId)
      .eq('version_number', versionNumber)
      .single()

    if (versionError || !version) {
      console.error('Error fetching version:', versionError)
      return null
    }

    // Обновляем проект данными из версии
    return await this.updateProject(projectId, {
      title: version.title,
      data: version.data,
    })
  }

  async deleteVersion(versionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('project_versions')
      .delete()
      .eq('id', versionId)

    if (error) {
      console.error('Error deleting version:', error)
      return false
    }

    return true
  }

  // ========== ПОИСК ==========

  async searchProjects(query: string, type?: ProjectType): Promise<Project[]> {
    let supabaseQuery = supabase
      .from('projects')
      .select('*')
      .ilike('title', `%${query}%`)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false })

    if (type) {
      supabaseQuery = supabaseQuery.eq('type', type)
    }

    const { data: projects, error } = await supabaseQuery

    if (error) {
      console.error('Error searching projects:', error)
      return []
    }

    return projects || []
  }
}

export const projectsService = new ProjectsService()
