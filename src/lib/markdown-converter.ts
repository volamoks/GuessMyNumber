import type { ProjectType } from './projects-service'
import type { CJMData, BusinessCanvasData, LeanCanvasData, RoadmapData } from './schemas'

/**
 * Converts project data to Markdown format compatible with the Presentation feature.
 * 
 * Format:
 * # Slide Title
 * Content...
 * ---
 * # Next Slide
 * ...
 */
export function convertToSlideMarkdown(data: any, type: ProjectType): string {
    switch (type) {
        case 'cjm':
            return convertCJMToMarkdown(data as CJMData)
        case 'business_canvas':
            return convertBusinessCanvasToMarkdown(data as BusinessCanvasData)
        case 'lean_canvas':
            return convertLeanCanvasToMarkdown(data as LeanCanvasData)
        case 'roadmap':
            return convertRoadmapToMarkdown(data as RoadmapData)
        default:
            return '# Unknown Project Type\nCannot convert this project type to slides.'
    }
}

function convertCJMToMarkdown(data: CJMData): string {
    return `# ${data.title}\n\n\`\`\`canvas\n${JSON.stringify({ ...data, type: 'cjm' }, null, 2)}\n\`\`\``
}

function convertBusinessCanvasToMarkdown(data: BusinessCanvasData): string {
    return `# ${data.title}\n\n\`\`\`canvas\n${JSON.stringify({ ...data, type: 'business_model_canvas' }, null, 2)}\n\`\`\``
}

function convertLeanCanvasToMarkdown(data: LeanCanvasData): string {
    return `# ${data.title}\n\n\`\`\`canvas\n${JSON.stringify({ ...data, type: 'lean_canvas' }, null, 2)}\n\`\`\``
}

function convertRoadmapToMarkdown(data: RoadmapData): string {
    return `# ${data.title}\n\n\`\`\`roadmap\n${JSON.stringify(data, null, 2)}\n\`\`\``
}
