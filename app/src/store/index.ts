// Модульная архитектура сторов
// Каждая фича имеет свой изолированный стор
// Легко добавлять новые фичи (PM артефакты, интеграции и т.д.)

export { useGlobalStore } from './globalStore'
export { useCJMStore } from './cjmStore'
export { useBusinessCanvasStore } from './businessCanvasStore'
export { useLeanCanvasStore } from './leanCanvasStore'
export { useProjectsStore } from './projectsStore'
