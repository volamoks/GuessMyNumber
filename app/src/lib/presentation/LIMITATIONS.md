# PptxGenJS Limitations & Workarounds

## What IS Supported

✅ **Tables** - Full support via `slide.addTable()`
- Headers with styling
- Row alternating colors
- Cell alignment
- Borders

✅ **Lists** - Full support via `slide.addText()` with bullet options
- Ordered lists (`bullet: { type: 'number' }`)
- Unordered lists (`bullet: true`)
- Nested lists via `indentLevel`
- Task lists (checkboxes as Unicode characters)

✅ **Code Blocks** - Full support
- Monospace font
- Background color
- Language label

✅ **Images** - Support for URLs and base64
- `slide.addImage({ path: url })`
- `slide.addImage({ data: base64 })`
- Sizing and positioning

✅ **Text Formatting**
- Bold, Italic, Strikethrough
- Font colors and sizes
- Multiple fonts in same text block

✅ **Blockquotes** - Rendered as styled shape with left border

✅ **Charts** - Full support for data visualization
- Bar charts (`type: 'bar'`)
- Pie charts (`type: 'pie'`)
- Line charts (`type: 'line'`)
- Area charts (`type: 'area'`)
- Doughnut charts (`type: 'doughnut'`)
- Custom colors and styling

✅ **Custom Layouts** - Master slide layouts
- Roadmap 3-column layout
- Canvas 3x3 grid layout
- Two-column layout
- Title-only layout
- Content with sidebar layout

✅ **Shapes** - Decorative and structural elements
- Rectangles, rounded rectangles
- Arrows and connectors
- Highlight boxes (info, warning, success, error)
- Dividers and lines
- Shadows and styling

## What is NOT Supported (Limitations)

❌ **Clickable Hyperlinks in Text Arrays**
- PptxGenJS doesn't support `hyperlink` in text run arrays
- **Workaround**: Show link text with URL in parentheses
- Example: "Visit Website (https://example.com)"

❌ **Inline HTML**
- HTML tags are not processed
- **Workaround**: Parse HTML to text or skip

❌ **Complex Nested Structures**
- Lists inside blockquotes
- Tables inside lists
- **Workaround**: Flatten or render separately

❌ **Footnotes**
- No native support
- **Workaround**: Add as slide notes or separate section

❌ **Math/LaTeX**
- No native support
- **Workaround**: Render as image or skip

❌ **Syntax Highlighting**
- Code blocks are monospace but not colored by syntax
- **Workaround**: Use language label only

## Best Practices

1. **Keep slides simple** - Complex nesting may not render correctly
2. **Use explicit URLs** - Since hyperlinks aren't clickable, show full URLs
3. **Limit table size** - Large tables may overflow slide
4. **Test export** - Always verify the output PPTX file

## Technical Notes

### Text Run Format
```typescript
// CORRECT - bullet with indentation
{
  text: "Item text",
  options: {
    bullet: true,           // or { type: 'number' }
    indentLevel: 0,         // 0, 1, 2 for nesting
    color: 'FFFFFF',        // without #
    fontSize: 18
  }
}
```

### Table Cell Format
```typescript
{
  text: "Cell content",
  options: {
    bold: true,
    fill: { color: 'E5E7EB' },  // background
    color: '1F2937',             // text color
    align: 'left',               // or 'center', 'right'
    valign: 'middle'
  }
}
```

### Colors
- Always use 6-character hex WITHOUT # prefix
- Example: `'3B82F6'` not `'#3B82F6'`

### Dimensions
- All measurements in INCHES
- Default slide: 10" x 5.625" (16:9)
- Font sizes in POINTS

## Enhanced Features

### Using Charts
```typescript
import { roadmapToChartData, roadmapToPriorityChart } from '@/lib/presentation/adapters/roadmap-enhanced'
import { canvasToPieChart, canvasToMetricsChart } from '@/lib/presentation/adapters/business-canvas-enhanced'

// Generate chart from Roadmap data
const chartData = roadmapToChartData(roadmapData)
const priorityChart = roadmapToPriorityChart(roadmapData)

// Generate chart from Canvas data
const coverageChart = canvasToPieChart(canvasData)
const metricsChart = canvasToMetricsChart(canvasData)
```

### Using Custom Layouts
```typescript
import { defineCustomLayouts, getRoadmapColumnPositions, getCanvasGridPositions } from '@/lib/presentation/export/layouts'

// Define custom master slides
defineCustomLayouts(pptx, theme)

// Use roadmap 3-column layout
const columns = getRoadmapColumnPositions()
// columns[0] = { x: 0.5, y: 1.5, w: 2.8, h: 3.5 } // NOW column
// columns[1] = { x: 3.4, y: 1.5, w: 2.8, h: 3.5 } // NEXT column
// columns[2] = { x: 6.8, y: 1.5, w: 2.8, h: 3.5 } // LATER column

// Use canvas 3x3 grid
const grid = getCanvasGridPositions()
// grid[0][0] = top-left cell, grid[0][1] = top-center, etc.
```

### Using Shapes
```typescript
import { renderHighlightBox, renderArrow, renderDivider } from '@/lib/presentation/export/renderers/shape'

// Add colored highlight box
renderHighlightBox(slide, context, width, height, 'info')  // or 'warning', 'success', 'error'

// Add arrow between elements
renderArrow(slide, context, fromX, fromY, toX, toY, color)

// Add section divider
renderDivider(slide, context, width)
```
