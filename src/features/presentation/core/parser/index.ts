/**
 * Главный парсер markdown → AST
 */

import { marked } from 'marked'
import type { PresentationAST, SlideNode } from '../types/ast'
import { tokenize, splitIntoSlides } from './tokenizer'
import { buildSlideAST } from './ast-builder'

export interface ParseOptions {
  slideDelimiter?: string
  extractMetadata?: boolean
}

/**
 * Парсит markdown презентацию в AST
 */
export function parseMarkdownToAST(markdown: string, options: ParseOptions = {}): PresentationAST {
  const slideTexts = splitIntoSlides(markdown)
  const slides: SlideNode[] = []

  for (const slideText of slideTexts) {
    const tokens = tokenize(slideText)
    const slideAST = buildSlideAST(tokens)
    slides.push(slideAST)
  }

  return {
    slides,
    metadata: options.extractMetadata ? extractMetadata(markdown) : undefined,
  }
}

/**
 * Парсит один слайд
 */
export function parseSlideMarkdown(markdown: string): SlideNode {
  const tokens = tokenize(markdown)
  return buildSlideAST(tokens)
}

/**
 * Конвертирует markdown в HTML для превью
 */
export function markdownToHtml(markdown: string): string {
  const renderer = new marked.Renderer()

  renderer.code = ({ text, lang }: { text: string, lang?: string }) => {
    if (lang === 'canvas') {
      try {
        const data = JSON.parse(text)
        return renderCanvasHtml(data)
      } catch (e) {
        return `<div class="text-red-500">Invalid Canvas JSON</div>`
      }
    }
    if (lang === 'roadmap') {
      try {
        const data = JSON.parse(text)
        return renderRoadmapHtml(data)
      } catch (e) {
        return `<div class="text-red-500">Invalid Roadmap JSON</div>`
      }
    }
    if (lang === 'mermaid') {
      const id = `mermaid-${Math.random().toString(36).slice(2)}`
      return `<div class="mermaid not-prose" id="${id}">${text}</div>`
    }
    return `<pre><code class="language-${lang}">${text}</code></pre>`
  }

  marked.setOptions({
    gfm: true,
    breaks: false,
    renderer,
  })

  return marked.parse(markdown, { async: false }) as string
}

function renderCanvasHtml(data: any): string {
  const isBMC = data.type === 'business_model_canvas'
  const isCJM = data.type === 'cjm'

  if (isCJM) {
    return renderCJMHtml(data)
  }

  // Shared grid layout for BMC and Lean
  const sections = isBMC ? {
    col1: { title: 'Key Partners', items: data.keyPartners },
    col2_top: { title: 'Key Activities', items: data.keyActivities },
    col2_bottom: { title: 'Key Resources', items: data.keyResources },
    col3: { title: 'Value Propositions', items: data.valueProposition },
    col4_top: { title: 'Customer Relationships', items: data.customerRelationships },
    col4_bottom: { title: 'Channels', items: data.channels },
    col5: { title: 'Customer Segments', items: data.customerSegments },
    bottom1: { title: 'Cost Structure', items: data.costStructure },
    bottom2: { title: 'Revenue Streams', items: data.revenueStreams },
  } : {
    col1: { title: 'Problem', items: data.problem },
    col2_top: { title: 'Solution', items: data.solution },
    col2_bottom: { title: 'Key Metrics', items: data.keyMetrics },
    col3: { title: 'Unique Value Prop', items: [data.uniqueValueProposition] },
    col4_top: { title: 'Unfair Advantage', items: data.unfairAdvantage },
    col4_bottom: { title: 'Channels', items: data.channels },
    col5: { title: 'Customer Segments', items: data.customerSegments },
    bottom1: { title: 'Cost Structure', items: data.costStructure },
    bottom2: { title: 'Revenue Streams', items: data.revenueStreams },
  }

  const renderList = (items: string[]) => items?.map(i => `<div class="text-[10px] leading-tight mb-1">• ${i}</div>`).join('') || ''

  return `
    <div class="w-full border rounded-lg overflow-hidden my-4" style="font-size: 10px; font-family: inherit; background-color: var(--background); color: var(--foreground); border-color: var(--border);">
      <div class="grid grid-cols-5 border-b" style="border-color: var(--border);">
        <div class="border-r p-2 h-64 overflow-auto" style="border-color: var(--border);">
          <div class="font-bold mb-2" style="color: var(--primary);">${sections.col1.title}</div>
          ${renderList(sections.col1.items)}
        </div>
        <div class="border-r flex flex-col h-64" style="border-color: var(--border);">
          <div class="flex-1 border-b p-2 overflow-auto" style="border-color: var(--border);">
            <div class="font-bold mb-2" style="color: var(--primary);">${sections.col2_top.title}</div>
            ${renderList(sections.col2_top.items)}
          </div>
          <div class="flex-1 p-2 overflow-auto">
            <div class="font-bold mb-2" style="color: var(--primary);">${sections.col2_bottom.title}</div>
            ${renderList(sections.col2_bottom.items)}
          </div>
        </div>
        <div class="border-r p-2 h-64 overflow-auto" style="border-color: var(--border);">
          <div class="font-bold mb-2" style="color: var(--primary);">${sections.col3.title}</div>
          ${renderList(sections.col3.items)}
        </div>
        <div class="border-r flex flex-col h-64" style="border-color: var(--border);">
          <div class="flex-1 border-b p-2 overflow-auto" style="border-color: var(--border);">
            <div class="font-bold mb-2" style="color: var(--primary);">${sections.col4_top.title}</div>
            ${renderList(sections.col4_top.items)}
          </div>
          <div class="flex-1 p-2 overflow-auto">
            <div class="font-bold mb-2" style="color: var(--primary);">${sections.col4_bottom.title}</div>
            ${renderList(sections.col4_bottom.items)}
          </div>
        </div>
        <div class="p-2 h-64 overflow-auto">
          <div class="font-bold mb-2" style="color: var(--primary);">${sections.col5.title}</div>
          ${renderList(sections.col5.items)}
        </div>
      </div>
      <div class="grid grid-cols-2">
        <div class="border-r p-2 h-24 overflow-auto" style="border-color: var(--border);">
          <div class="font-bold mb-2" style="color: var(--primary);">${sections.bottom1.title}</div>
          ${renderList(sections.bottom1.items)}
        </div>
        <div class="p-2 h-24 overflow-auto">
          <div class="font-bold mb-2" style="color: var(--primary);">${sections.bottom2.title}</div>
          ${renderList(sections.bottom2.items)}
        </div>
      </div>
    </div>
  `
}

function renderCJMHtml(data: any): string {
  const stages = data.stages || []
  const renderList = (items: string[]) => items?.map(i => `<div class="text-[9px] leading-tight mb-1" style="font-size: 9px;">• ${i}</div>`).join('') || ''

  return `
    <div class="w-full overflow-x-auto border rounded-lg my-4" style="font-family: inherit; background-color: var(--background); color: var(--foreground); border-color: var(--border);">
      <div class="flex min-w-max">
        ${stages.map((stage: any) => `
          <div class="w-48 border-r last:border-r-0 flex flex-col" style="border-color: var(--border);">
            <div class="p-2 border-b font-bold text-center text-xs" style="background-color: var(--primary); color: #ffffff; border-color: var(--border);">
              ${stage.name}
            </div>
            <div class="p-2 border-b h-24 overflow-auto" style="border-color: var(--border);">
              <div class="text-[9px] font-semibold mb-1" style="color: var(--muted-foreground); font-size: 9px;">Goals</div>
              ${renderList(stage.customerGoals)}
            </div>
            <div class="p-2 border-b h-32 overflow-auto" style="border-color: var(--border);">
              <div class="text-[9px] font-semibold mb-1" style="color: var(--muted-foreground); font-size: 9px;">Activities</div>
              ${renderList(stage.customerActivities)}
            </div>
            <div class="p-2 border-b h-20 overflow-auto flex items-center justify-center" style="border-color: var(--border); font-size: 12px;">
              ${stage.experience?.join(' ') || ''}
            </div>
            <div class="p-2 h-24 overflow-auto" style="background-color: rgba(239, 68, 68, 0.1);">
              <div class="text-[9px] font-semibold mb-1" style="color: #ef4444; font-size: 9px;">Pain Points</div>
              ${renderList(stage.negatives)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

function renderRoadmapHtml(data: any): string {
  const renderCard = (item: any) => `
    <div class="p-2 mb-2 border rounded shadow-sm" style="background-color: var(--card); border-color: var(--border);">
      <div class="font-bold text-xs mb-1 flex justify-between">
        <span>${item.title}</span>
        <span class="text-[9px] px-1 rounded" style="${item.priority === 'high' ? 'background-color: rgba(239, 68, 68, 0.1); color: #ef4444;' : 'background-color: rgba(59, 130, 246, 0.1); color: #3b82f6;'} font-size: 9px;">
          ${item.priority?.toUpperCase().slice(0, 1)}
        </span>
      </div>
      ${item.description ? `<div class="text-[9px] line-clamp-2" style="color: var(--muted-foreground); font-size: 9px;">${item.description}</div>` : ''}
    </div>
  `

  return `
    <div class="grid grid-cols-3 gap-4 my-4 h-96" style="font-family: inherit;">
      <div class="rounded-lg p-2 border flex flex-col" style="background-color: var(--muted); border-color: var(--border);">
        <div class="font-bold text-center mb-3 p-1 rounded" style="background-color: var(--primary); color: #ffffff;">NOW</div>
        <div class="overflow-auto flex-1">
          ${data.now?.map(renderCard).join('') || '<div class="text-center text-xs italic" style="color: var(--muted-foreground);">Empty</div>'}
        </div>
      </div>
      <div class="rounded-lg p-2 border flex flex-col" style="background-color: var(--muted); border-color: var(--border);">
        <div class="font-bold text-center mb-3 p-1 rounded" style="background-color: var(--primary); color: #ffffff;">NEXT</div>
        <div class="overflow-auto flex-1">
          ${data.next?.map(renderCard).join('') || '<div class="text-center text-xs italic" style="color: var(--muted-foreground);">Empty</div>'}
        </div>
      </div>
      <div class="rounded-lg p-2 border flex flex-col" style="background-color: var(--muted); border-color: var(--border);">
        <div class="font-bold text-center mb-3 p-1 rounded" style="background-color: var(--primary); color: #ffffff;">LATER</div>
        <div class="overflow-auto flex-1">
          ${data.later?.map(renderCard).join('') || '<div class="text-center text-xs italic" style="color: var(--muted-foreground);">Empty</div>'}
        </div>
      </div>
    </div>
  `
}

/**
 * Извлекает метаданные из markdown (YAML front matter)
 */
function extractMetadata(markdown: string): Record<string, string> | undefined {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/)
  if (!match) return undefined

  const yamlText = match[1]
  const metadata: Record<string, string> = {}

  for (const line of yamlText.split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim()
      metadata[key] = value
    }
  }

  return metadata
}

// Re-export types and utilities
export * from './tokenizer'
export * from './ast-builder'
