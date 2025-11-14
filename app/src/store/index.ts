// Модульная архитектура сторов
// Каждая фича имеет свой изолированный стор
// Легко добавлять новые фичи (PM артефакты, интеграции и т.д.)

export { useGlobalStore, type AIModelConfig } from './globalStore'
export { useCJMStore } from './cjmStore'
export { useBusinessCanvasStore, type BusinessCanvasData } from './businessCanvasStore'
export { useLeanCanvasStore, type LeanCanvasData } from './leanCanvasStore'
export { useRoadmapStore, type RoadmapData, type RoadmapFeature } from './roadmapStore'
export { useProjectsStore } from './projectsStore'
export { useThemeStore } from './themeStore'
export { useGanttStore, type GanttData } from './ganttStore'
export { useAIPromptsStore, type PromptTemplate } from './aiPromptsStore'
