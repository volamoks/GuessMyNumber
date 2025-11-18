/**
 * Типы для модуля презентаций
 *
 * DEPRECATED: Используйте импорты из @/lib/presentation
 * Этот файл сохранён для обратной совместимости
 */

// Re-export типов из нового модульного API
export { DEFAULT_THEMES } from './presentation/types/theme'
export type { PresentationTheme } from './presentation/types/theme'
export type { SlideNode } from './presentation/types/ast'

// Import for local use
import type { PresentationTheme } from './presentation/types/theme'

// Старые типы для обратной совместимости
export interface SlideContent {
  type: 'title' | 'text' | 'bullets' | 'code' | 'image' | 'table'
  content: string
  options?: {
    language?: string // для code blocks
    level?: number // для bullet lists
    alt?: string // для images
  }
}

export interface Slide {
  id: string
  title: string
  content: SlideContent[]
  notes?: string // speaker notes
  layout?: 'title' | 'content' | 'two-column' | 'image-full'
}

export interface Presentation {
  id: string
  title: string
  author?: string
  createdAt: Date
  updatedAt: Date
  slides: Slide[]
  theme: PresentationTheme
  markdown: string // исходный markdown
}

export const SAMPLE_MARKDOWN = `# Presentation Guide

Complete reference for all supported markdown elements

---

## Text Formatting

**Bold text** for emphasis

*Italic text* for subtle emphasis

~~Strikethrough~~ for removed content

Inline \`code\` for technical terms

Combined: **_bold and italic_** text

---

## Headings Demo

# Heading 1 - Title Size
## Heading 2 - Section
### Heading 3 - Subsection
#### Heading 4 - Minor heading

Use headings to structure your content hierarchically.

---

## Lists: Unordered

Simple bullet list:

- First item
- Second item
- Third item with **bold**

Nested list:

- Parent item
  - Child item 1
  - Child item 2
    - Grandchild item

---

## Lists: Ordered

1. First step
2. Second step
3. Third step

Nested numbered list:

1. Main point
   1. Sub-point A
   2. Sub-point B
2. Another main point

---

## Lists: Task Lists

- [x] Completed task
- [x] Another done item
- [ ] Pending task
- [ ] Future work

Great for roadmaps and progress tracking!

---

## Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Authentication | ✅ Done | High |
| Dashboard | 🚧 In Progress | High |
| Analytics | 📋 Planned | Medium |
| Mobile App | 💡 Idea | Low |

Tables support alignment and formatting.

---

## Code Blocks

Python example:

\`\`\`python
def calculate_total(items):
    return sum(item.price for item in items)
\`\`\`

JavaScript example:

\`\`\`javascript
const greet = (name) => {
  console.log(\`Hello, \${name}!\`)
}
\`\`\`

---

## Blockquotes

> Important note: Always test your presentations before the meeting.

> **Pro tip:** Use blockquotes for key takeaways, warnings, or important information that needs to stand out.

---

## Links

Visit our [Documentation](https://example.com/docs)

Check the [GitHub repo](https://github.com/example/repo)

Note: Links are shown with URLs in parentheses in PPTX export.

---

## Mixed Content

Combining multiple elements:

1. **Step 1**: Install dependencies
   - Run \`npm install\`
   - Verify with \`npm --version\`

2. **Step 2**: Configure settings
   \`\`\`json
   {
     "theme": "dark",
     "fontSize": 18
   }
   \`\`\`

3. **Step 3**: Run the app

---

## Charts & Visualizations

Charts are supported via enhanced adapters:

- 📊 Bar charts for comparisons
- 🥧 Pie charts for distributions
- 📈 Line charts for trends
- 📉 Area charts for volume over time

Use \`roadmapToChartData()\` or \`canvasToPieChart()\`

---

## Custom Layouts

Special layouts available:

- **3-Column Roadmap**: NOW | NEXT | LATER
- **3x3 Canvas Grid**: Business Model Canvas
- **Two-Column**: Side-by-side content
- **Title-Only**: Full-size images/charts

Define with \`defineCustomLayouts(pptx, theme)\`

---

## Highlight Boxes

Use shapes for visual emphasis:

💡 Info boxes for tips
⚠️ Warning boxes for cautions
✅ Success boxes for achievements
❌ Error boxes for issues

Add with \`renderHighlightBox()\`

---

## Best Practices

1. **Keep it simple** - One idea per slide
2. **Use visuals** - Charts and tables engage audience
3. **Consistent style** - Stick to one theme
4. **Test export** - Always preview PPTX before presenting
5. **Limit text** - Use bullet points, not paragraphs

---

## Advanced Features

Combine elements for rich slides:

| Metric | Q1 | Q2 | Q3 |
|--------|----|----|-----|
| Revenue | $100k | $150k | $200k |
| Users | 1,000 | 2,500 | 5,000 |

> 📈 **Growth**: 100% increase in Q3!

Next: Add trend charts with \`createLineChart()\`

---

## Thank You!

🎉 You now know all supported markdown features!

**Questions?**

Visit [docs](https://example.com) or check EXAMPLES.md
`
