/**
 * Типы для модуля презентаций
 *
 * DEPRECATED: Используйте импорты из @/lib/presentation
 * Этот файл сохранён для обратной совместимости
 */

// Re-export типов из нового модульного API
export { DEFAULT_THEMES } from './core/types/theme'
export type { PresentationTheme, SlideStyle } from './core/types/theme'
export type { SlideNode } from './core/types/ast'
export type { LogoSettings, SlideSize } from './core/types/export'

// Import for local use
import type { PresentationTheme, SlideStyle } from './core/types/theme'
import type { LogoSettings, SlideSize } from './core/types/export'

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

export interface PresentationSettings {
  // Metadata
  author?: string
  company?: string

  // Layout
  layout: SlideSize

  // Fonts
  fontFamily: string
  slideStyle: SlideStyle

  // Branding
  logo: LogoSettings
  backgroundImage?: string
  backgroundOpacity: number // 0-100
  footer?: string
  showDate?: boolean
  dateFormat?: 'locale' | 'ISO' | 'US' | 'EU'
  datePosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
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
  settings?: PresentationSettings
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

## Best Practices

1. **Keep it simple** - One idea per slide
2. **Use visuals** - Charts and tables engage audience
3. **Consistent style** - Stick to one theme
4. **Test export** - Always preview PPTX before presenting
5. **Limit text** - Use bullet points, not paragraphs

---

## Thank You!

🎉 You now know all supported markdown features!

**Questions?**

Visit [docs](https://example.com) or check EXAMPLES.md
`

export const DEFAULT_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Presentation',
    description: 'Start from scratch',
    content: '# Title Slide\n\nSubtitle\n\n---\n\n# Slide 2\n\n* Point 1\n* Point 2'
  },
  {
    id: 'pitch',
    name: 'Pitch Deck',
    description: 'Standard startup pitch deck structure',
    content: `# My Startup
The Next Big Thing

---

# The Problem

* Current solutions are slow
* Users are frustrated
* Costs are high

---

# The Solution

* Our product is 10x faster
* Intuitive user interface
* Affordable pricing

---

# Market Size

| Segment | Size |
|---------|------|
| TAM | $10B |
| SAM | $2B |
| SOM | $500M |

---

# Business Model

* Subscription (SaaS)
* Enterprise Licensing
* Marketplace Fees

---

# The Team

* **CEO**: Visionary Leader
* **CTO**: Tech Wizard
* **COO**: Operations Guru

---

# Contact Us

email@example.com
`
  },
  {
    id: 'project-update',
    name: 'Project Update',
    description: 'Weekly or monthly project status report',
    content: `# Project Status Update
Week 42

---

# Executive Summary

* ✅ Phase 1 Completed
* 🚧 Phase 2 In Progress
* 📅 On Schedule

---

# Key Achievements

* Deployed new feature X
* Fixed critical bug Y
* Onboarded 5 new clients

---

# Blockers & Risks

> ⚠️ **Risk**: API Rate Limits
> Mitigation: Implement caching layer

* Dependency on external team
* Resource constraints

---

# Next Steps

1. Finalize QA for Phase 2
2. Prepare marketing materials
3. Schedule stakeholder review
`
  }
]
