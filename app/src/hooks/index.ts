/**
 * Custom Hooks для JIRA Gantt
 *
 * Эти хуки инкапсулируют бизнес-логику и отделяют её от UI компонентов.
 * Компоненты используют только эти хуки и не работают напрямую с сервисами.
 */

export { useJiraConnection } from './useJiraConnection'
export { useJiraProjects } from './useJiraProjects'
export { useJiraSync } from './useJiraSync'
export { useGanttData } from './useGanttData'
