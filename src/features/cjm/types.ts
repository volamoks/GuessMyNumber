export interface CJMStage {
    name: string
    customerActivities: string[]
    customerGoals: string[]
    touchpoints: string[]
    experience: string[]
    positives: string[]
    negatives: string[]
    ideasOpportunities: string[]
    businessGoal: string
    kpis: string[]
    organizationalActivities: string[]
    responsibility: string[]
    technologySystems: string[]
}

export interface CJMData {
    title: string
    persona: string
    description?: string
    stages: CJMStage[]
}
