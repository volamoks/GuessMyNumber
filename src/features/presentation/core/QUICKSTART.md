# Quick Start: Charts, Layouts & Shapes

## Что можно делать из Markdown

### ✅ Используй в редакторе (Markdown)

```markdown
# Title
**bold** *italic* `code`

| Table | Header |
|-------|--------|
| Cell  | Data   |

- Lists
- Code blocks
- Blockquotes
```

## Что требует TypeScript API

### 📊 Charts - Программное добавление

**НЕ работает из markdown, только через TypeScript:**

```typescript
import PptxGenJS from 'pptxgenjs'
import { roadmapToChartData, roadmapToPriorityChart } from '@/lib/presentation/adapters/roadmap-enhanced'
import { renderChart } from '@/lib/presentation/export/renderers/chart'

// 1. Подготовь данные
const roadmapData = {
  now: [
    { title: 'Feature A', priority: 'high', effort: 'large' },
    { title: 'Feature B', priority: 'medium', effort: 'small' },
  ],
  next: [
    { title: 'Feature C', priority: 'high', effort: 'medium' },
  ],
  later: []
}

// 2. Создай график
const chartData = roadmapToChartData(roadmapData)

// 3. Добавь на слайд
const pptx = new PptxGenJS()
const slide = pptx.addSlide()
const context = {
  theme: DEFAULT_THEMES[0],
  slideStyle: DEFAULT_SLIDE_STYLE,
  currentY: 1.0,
  slideWidth: 10,
  slideHeight: 5.625,
  contentWidth: 9
}

renderChart(slide, chartData, context)

// 4. Экспорт
await pptx.writeFile({ fileName: 'roadmap-with-chart.pptx' })
```

### 🎨 Custom Layouts - Специальные макеты

```typescript
import { defineCustomLayouts, getRoadmapColumnPositions } from '@/lib/presentation/export/layouts'

const pptx = new PptxGenJS()

// 1. Определи макеты (один раз)
defineCustomLayouts(pptx, theme)

// 2. Используй макет
const slide = pptx.addSlide({ masterName: 'ROADMAP_THREE_COLUMN' })

// 3. Получи позиции колонок
const columns = getRoadmapColumnPositions()
// columns[0] = { x: 0.5, y: 1.5, w: 2.8, h: 3.5 } // NOW
// columns[1] = { x: 3.4, y: 1.5, w: 2.8, h: 3.5 } // NEXT
// columns[2] = { x: 6.8, y: 1.5, w: 2.8, h: 3.5 } // LATER

// 4. Добавь контент в каждую колонку
slide.addText('NOW', {
  x: columns[0].x,
  y: columns[0].y - 0.3,
  w: columns[0].w,
  h: 0.3,
  bold: true
})

const items = [
  { text: 'Feature A' },
  { text: 'Feature B' }
]

slide.addText(items, {
  x: columns[0].x,
  y: columns[0].y,
  w: columns[0].w,
  h: columns[0].h
})
```

### ⬜ Shapes - Фигуры и декор

```typescript
import { renderHighlightBox, renderArrow, renderDivider } from '@/lib/presentation/export/renderers/shape'

const pptx = new PptxGenJS()
const slide = pptx.addSlide()

// Highlight box
renderHighlightBox(slide, context, 8.0, 1.0, 'info')
slide.addText('💡 Important information', {
  x: 0.7,
  y: context.currentY + 0.3,
  w: 7.6,
  h: 0.5
})

// Arrow
renderArrow(slide, context, 2.0, 2.0, 5.0, 2.0)

// Divider
context.currentY = 3.0
renderDivider(slide, context, 9.0)
```

## Полный пример: Dashboard со всем

```typescript
import PptxGenJS from 'pptxgenjs'
import { DEFAULT_THEMES, DEFAULT_SLIDE_STYLE } from '@/lib/presentation/types/theme'
import { parseMarkdownToAST } from '@/lib/presentation/parser'
import { exportASTToPptx } from '@/lib/presentation/export/service'
import { createBarChart } from '@/lib/presentation/export/renderers/chart'
import { renderChart } from '@/lib/presentation/export/renderers/chart'
import { renderHighlightBox } from '@/lib/presentation/export/renderers/shape'

async function createDashboard() {
  const pptx = new PptxGenJS()
  const theme = DEFAULT_THEMES[0]

  // Слайд 1: Заголовок (из markdown)
  const titleMarkdown = `# Q4 Dashboard\n\n2024 Performance Review`
  const titleAST = parseMarkdownToAST(titleMarkdown)
  // ... добавь слайд

  // Слайд 2: Метрики с графиком (программно)
  const metricsSlide = pptx.addSlide()

  // Заголовок
  metricsSlide.addText('Key Metrics', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.5,
    fontSize: 32,
    bold: true
  })

  // График
  const context = {
    theme,
    slideStyle: DEFAULT_SLIDE_STYLE,
    currentY: 1.2,
    slideWidth: 10,
    slideHeight: 5.625,
    contentWidth: 9
  }

  const salesChart = createBarChart(
    ['Jan', 'Feb', 'Mar', 'Apr'],
    [100, 150, 120, 180],
    'Monthly Sales'
  )

  renderChart(metricsSlide, salesChart, context)

  // Highlight box с выводом
  context.currentY = 4.0
  renderHighlightBox(metricsSlide, context, 9.0, 0.8, 'success')
  metricsSlide.addText('✅ Target achieved: +80% growth', {
    x: 0.7,
    y: context.currentY + 0.25,
    w: 8.6,
    h: 0.4,
    fontSize: 16
  })

  // Экспорт
  await pptx.writeFile({ fileName: 'dashboard.pptx' })
}
```

## Как использовать

### Вариант 1: Чистый Markdown (рекомендуется)

Используй редактор презентаций:
1. Пиши markdown
2. Смотри preview
3. Экспортируй в PPTX

**Поддерживается:**
- Текст, списки, таблицы
- Код, ссылки, blockquotes
- Всё из шпаргалки

### Вариант 2: TypeScript API (для продвинутых)

Создай `.ts` файл с кодом:
1. Импортируй модули
2. Создай `PptxGenJS` презентацию
3. Добавь слайды программно
4. Используй charts, layouts, shapes

**Дополнительно:**
- Графики (bar, pie, line)
- Кастомные макеты (3-column, grid)
- Фигуры (boxes, arrows, dividers)

### Вариант 3: Гибрид (лучшее из обоих)

1. Основные слайды - markdown
2. Сложные слайды с графиками - TypeScript
3. Объедини оба подхода

```typescript
// 1. Парси markdown слайды
const markdown = `# Intro\n...\n---\n## Content\n...`
const ast = parseMarkdownToAST(markdown)

// 2. Экспорт с дополнительной обработкой
const pptx = new PptxGenJS()

// Добавь markdown слайды
for (const slideNode of ast.slides) {
  const slide = pptx.addSlide()
  // рендер slideNode...
}

// 3. Добавь кастомный слайд с графиком
const chartSlide = pptx.addSlide()
const chart = createBarChart(...)
renderChart(chartSlide, chart, context)

// 4. Экспорт
await pptx.writeFile({ fileName: 'hybrid.pptx' })
```

## FAQ

**Q: Можно ли добавить график из markdown?**
A: Нет, только через TypeScript API. Markdown не поддерживает charts.

**Q: Как выбрать макет в markdown?**
A: Нельзя. Макеты работают только программно через `pptx.addSlide({ masterName: '...' })`

**Q: Зачем тогда Charts/Layouts/Shapes?**
A: Для программного создания сложных презентаций (dashboard'ы, roadmap'ы с визуализациями)

**Q: Что проще использовать?**
A: Для простых презентаций - markdown. Для сложных с графиками - TypeScript API.

## См. также

- `EXAMPLES.md` - полные примеры кода
- `LIMITATIONS.md` - что поддерживается
- `presentation-types.ts` - все типы данных
