# Presentation Module Examples

## Basic Usage

### Creating a Simple Presentation

```typescript
import { parseMarkdownToAST } from '@/lib/presentation/parser'
import { exportASTToPptx } from '@/lib/presentation/export/service'
import { DEFAULT_THEMES } from '@/lib/presentation/types/theme'

const markdown = `
# Welcome

---

## Features

- Easy markdown editing
- Live preview
- Export to PPTX

---

## Code Example

\`\`\`typescript
function hello(name: string) {
  return \`Hello, \${name}!\`
}
\`\`\`
`

const ast = parseMarkdownToAST(markdown)

await exportASTToPptx(ast, {
  title: 'My Presentation',
  theme: DEFAULT_THEMES[0],
  author: 'Your Name',
})
```

## Using Charts

### Roadmap with Charts

```typescript
import {
  roadmapToChartData,
  roadmapToPriorityChart,
  roadmapToEffortChart
} from '@/lib/presentation/adapters/roadmap-enhanced'
import { renderChart } from '@/lib/presentation/export/renderers/chart'

// Example roadmap data
const roadmapData: RoadmapData = {
  now: [
    { title: 'User Auth', priority: 'high', effort: 'large', status: 'in_progress', category: 'feature' },
    { title: 'Dashboard', priority: 'high', effort: 'medium', status: 'planning', category: 'feature' },
  ],
  next: [
    { title: 'Analytics', priority: 'medium', effort: 'large', status: 'planning', category: 'feature' },
  ],
  later: [
    { title: 'Mobile App', priority: 'low', effort: 'large', status: 'planning', category: 'feature' },
  ],
}

// Generate different chart views
const featureDistribution = roadmapToChartData(roadmapData)
const priorityDistribution = roadmapToPriorityChart(roadmapData)
const effortDistribution = roadmapToEffortChart(roadmapData)

// Add to slide
const slide = pptx.addSlide()
renderChart(slide, featureDistribution, context)
context.currentY += 4.0

renderChart(slide, priorityDistribution, context)
```

### Business Canvas with Charts

```typescript
import {
  canvasToPieChart,
  canvasToMetricsChart,
  getCanvasCompleteness
} from '@/lib/presentation/adapters/business-canvas-enhanced'

const canvasData: BusinessCanvasData = {
  keyPartners: ['Tech Partners', 'Distribution Partners'],
  keyActivities: ['Product Development', 'Marketing', 'Support'],
  valueProposition: ['Fast', 'Reliable', 'Affordable'],
  customerRelationships: ['Self-service', 'Communities'],
  channels: ['Website', 'Mobile App', 'Social Media'],
  customerSegments: ['SMBs', 'Enterprises'],
  keyResources: ['Development Team', 'Cloud Infrastructure'],
  costStructure: ['Salaries', 'Cloud Costs', 'Marketing'],
  revenueStreams: ['Subscriptions', 'Professional Services'],
}

// Get completeness metrics
const completeness = getCanvasCompleteness(canvasData)
console.log(`Canvas is ${completeness.percentage}% complete`)
console.log(`Missing: ${completeness.missing.join(', ')}`)

// Generate charts
const coverageChart = canvasToPieChart(canvasData)
const metricsChart = canvasToMetricsChart(canvasData)

// Add to slide
renderChart(slide, coverageChart, context)
```

## Using Custom Layouts

### Roadmap 3-Column Layout

```typescript
import {
  defineCustomLayouts,
  getRoadmapColumnPositions,
  prepareRoadmapColumns
} from '@/lib/presentation/export/layouts'
import { prepareRoadmapColumns } from '@/lib/presentation/adapters/roadmap-enhanced'

// Define all custom layouts once
defineCustomLayouts(pptx, theme)

// Create roadmap slide
const slide = pptx.addSlide({ masterName: 'ROADMAP_THREE_COLUMN' })

// Get column positions
const columns = getRoadmapColumnPositions()

// Prepare roadmap data
const columnData = prepareRoadmapColumns(roadmapData)

// Add content to each column
columnData.forEach((column, index) => {
  const pos = columns[index]

  // Add column title
  slide.addText(column.title, {
    x: pos.x,
    y: pos.y - 0.3,
    w: pos.w,
    h: 0.3,
    fontSize: 20,
    bold: true,
    color: theme.primaryColor.replace('#', ''),
  })

  // Add items as bullets
  const items = column.items.map(item => ({
    text: item.text,
    options: {
      bullet: true,
      fontSize: 14,
      color: item.priority === 'high' ? 'EF4444' : '1F2937',
    },
  }))

  slide.addText(items, {
    x: pos.x,
    y: pos.y,
    w: pos.w,
    h: pos.h,
  })
})
```

### Canvas 3x3 Grid Layout

```typescript
import {
  getCanvasGridPositions,
  prepareCanvasGrid
} from '@/lib/presentation/export/layouts'
import { prepareCanvasGrid } from '@/lib/presentation/adapters/business-canvas-enhanced'

const slide = pptx.addSlide({ masterName: 'CANVAS_GRID' })

const gridPositions = getCanvasGridPositions()
const gridData = prepareCanvasGrid(canvasData)

// Render each cell
gridData.forEach((row, rowIndex) => {
  row.forEach((cell, colIndex) => {
    const pos = gridPositions[rowIndex][colIndex]

    // Add cell title
    slide.addText(cell.title, {
      x: pos.x + 0.1,
      y: pos.y + 0.05,
      w: pos.w - 0.2,
      h: 0.25,
      fontSize: 12,
      bold: true,
      color: cell.color.replace('#', ''),
    })

    // Add items
    if (cell.items.length > 0) {
      const items = cell.items.map(item => ({
        text: item,
        options: {
          bullet: true,
          fontSize: 10,
        },
      }))

      slide.addText(items, {
        x: pos.x + 0.1,
        y: pos.y + 0.35,
        w: pos.w - 0.2,
        h: pos.h - 0.4,
        fontSize: 10,
      })
    }
  })
})
```

## Using Shapes

### Highlight Boxes

```typescript
import { renderHighlightBox } from '@/lib/presentation/export/renderers/shape'

// Add info box
renderHighlightBox(slide, context, 8.0, 1.0, 'info')
slide.addText('💡 This is important information', {
  x: context.slideStyle.padding + 0.2,
  y: context.currentY + 0.3,
  w: 7.6,
  h: 0.5,
  fontSize: 16,
})

// Add warning box
context.currentY += 1.2
renderHighlightBox(slide, context, 8.0, 1.0, 'warning')
slide.addText('⚠️ Please review carefully', {
  x: context.slideStyle.padding + 0.2,
  y: context.currentY + 0.3,
  w: 7.6,
  h: 0.5,
  fontSize: 16,
})

// Add success box
context.currentY += 1.2
renderHighlightBox(slide, context, 8.0, 1.0, 'success')
slide.addText('✅ Task completed successfully', {
  x: context.slideStyle.padding + 0.2,
  y: context.currentY + 0.3,
  w: 7.6,
  h: 0.5,
  fontSize: 16,
})

// Add error box
context.currentY += 1.2
renderHighlightBox(slide, context, 8.0, 1.0, 'error')
slide.addText('❌ Action required', {
  x: context.slideStyle.padding + 0.2,
  y: context.currentY + 0.3,
  w: 7.6,
  h: 0.5,
  fontSize: 16,
})
```

### Arrows and Connectors

```typescript
import { renderArrow } from '@/lib/presentation/export/renderers/shape'

// Create a flow diagram
slide.addText('Step 1', { x: 1, y: 2, w: 2, h: 0.5, align: 'center' })
renderArrow(slide, context, 3.1, 2.25, 4.9, 2.25) // Right arrow
slide.addText('Step 2', { x: 5, y: 2, w: 2, h: 0.5, align: 'center' })
renderArrow(slide, context, 7.1, 2.25, 8.9, 2.25) // Right arrow
slide.addText('Step 3', { x: 9, y: 2, w: 2, h: 0.5, align: 'center' })
```

### Dividers

```typescript
import { renderDivider } from '@/lib/presentation/export/renderers/shape'

slide.addText('Section 1', {
  x: 0.5,
  y: 1.5,
  w: 9,
  h: 0.5,
  fontSize: 24,
  bold: true,
})

context.currentY = 2.1
renderDivider(slide, context) // Full-width divider

slide.addText('Section 2', {
  x: 0.5,
  y: 2.5,
  w: 9,
  h: 0.5,
  fontSize: 24,
  bold: true,
})
```

## Complete Example: Dashboard Presentation

```typescript
import PptxGenJS from 'pptxgenjs'
import { DEFAULT_THEMES } from '@/lib/presentation/types/theme'
import { defineCustomLayouts } from '@/lib/presentation/export/layouts'
import { renderChart } from '@/lib/presentation/export/renderers/chart'
import { renderHighlightBox, renderDivider } from '@/lib/presentation/export/renderers/shape'
import { createBarChart, createPieChart } from '@/lib/presentation/export/renderers/chart'

const pptx = new PptxGenJS()
const theme = DEFAULT_THEMES[0]

// Define custom layouts
defineCustomLayouts(pptx, theme)

// Slide 1: Title
const titleSlide = pptx.addSlide()
titleSlide.addText('Q4 Dashboard', {
  x: 0.5,
  y: 2,
  w: 9,
  h: 1.5,
  fontSize: 48,
  bold: true,
  color: theme.primaryColor.replace('#', ''),
  align: 'center',
})

// Slide 2: Metrics Overview
const metricsSlide = pptx.addSlide()
metricsSlide.addText('Key Metrics', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.5,
  fontSize: 32,
  bold: true,
})

const context = {
  theme,
  slideStyle: { padding: 0.5, titleFontSize: 32, bodyFontSize: 18 },
  currentY: 1.2,
  slideWidth: 10,
  slideHeight: 5.625,
  contentWidth: 9,
}

// Add sales chart
const salesChart = createBarChart(
  ['Jan', 'Feb', 'Mar', 'Apr'],
  [100, 150, 120, 180],
  'Monthly Sales'
)
renderChart(metricsSlide, salesChart, context)

// Slide 3: Distribution
const distSlide = pptx.addSlide()
distSlide.addText('Market Distribution', {
  x: 0.5,
  y: 0.5,
  w: 9,
  h: 0.5,
  fontSize: 32,
  bold: true,
})

context.currentY = 1.2
const marketChart = createPieChart(
  ['North America', 'Europe', 'Asia', 'Other'],
  [45, 30, 20, 5],
  'Revenue by Region'
)
renderChart(distSlide, marketChart, context)

// Download
await pptx.writeFile({ fileName: 'dashboard.pptx' })
```

## Tips

1. **Always define custom layouts once** - Call `defineCustomLayouts()` once before creating slides
2. **Use context for positioning** - Track `currentY` to avoid overlapping elements
3. **Test with actual data** - Charts look better with real data
4. **Keep slides simple** - Don't overcrowd slides with too many elements
5. **Use consistent colors** - Stick to theme colors for professional look
6. **Preview before export** - Test the PPTX file to ensure everything renders correctly
