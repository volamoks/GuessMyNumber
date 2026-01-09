// Модульная архитектура сторов
// Каждая фича имеет свой изолированный стор
// Легко добавлять новые фичи (PM артефакты, интеграции и т.д.)

export { useAIStore } from './aiStore'
export { useProjectsStore } from '@/features/projects/store/projectsStore'
export { useThemeStore } from './themeStore'
export { useGanttStore, type GanttData } from '@/features/jira-gantt/store/ganttStore'
export { useAIPromptsStore, type PromptTemplate } from '@/features/ai/store/aiPromptsStore'
export { usePresentationStore } from '@/features/presentation/store/presentationStore'
