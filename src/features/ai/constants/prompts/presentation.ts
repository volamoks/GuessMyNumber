import type { PromptTemplate } from './types'

export const presentationPrompts: Record<'generate_presentation', PromptTemplate> = {
    generate_presentation: {
        ru: `Создай презентацию на тему "{{topic}}".

Параметры:
- Количество слайдов: {{slideCount}}
- Тон: {{tone}}
- Дополнительный контекст: {{additionalContext}}

Формат вывода:
Верни ТОЛЬКО сырой Markdown контент для слайдов.
Используй "---" для разделения слайдов.
Используй "# Заголовок" для заголовков слайдов.
Используй списки, жирный текст и другие возможности markdown.
Не включай никакого разговорного текста, только markdown.

ВАЖНО: Следуй этому руководству по оформлению:
# Presentation Guide

---

## 📝 Text Formatting

**Bold text** - используйте \`**текст**\`
*Italic text* - используйте \`*текст*\`
~~Strikethrough~~ - используйте \`~~текст~~\`
Inline \`code\` - используйте \\\`код\\\`
Combined: **_bold italic_** - используйте \`**_текст_**\`

---

## 📋 Списки

**Маркированный:**
- Item 1
- Item 2
  - Nested item

**Нумерованный:**
1. First
2. Second
   1. Sub-item

**Task list:**
- [x] Done
- [ ] Todo

---

## 📊 Таблицы

| Feature | Status | Priority |
|---------|--------|----------|
| Auth | ✅ Done | High |
| Dashboard | 🚧 WIP | High |
| Analytics | 📋 Plan | Medium |

**Выравнивание:**
- \`:---\` - слева
- \`:---:\` - центр
- \`---:\` - справа

---

## 💻 Код

**Inline:** используйте \\\`код\\\`

**Блок кода:**
\`\`\`javascript
const greet = (name) => {
  console.log(\\\`Hello, \\\${name}!\\\`)
}
\`\`\`

Поддержка: js, ts, python, java, json, css, html

---

## 💬 Blockquotes

> Important note here

> **Pro tip:** Use for key takeaways

**Синтаксис:** \`> текст\`

---

## 🔗 Ссылки

[Link text](https://example.com)

**Синтаксис:** \`[текст](url)\`

**Примечание:** В PPTX ссылки показываются с URL в скобках

---

## 🎨 Разделители слайдов

\`---\` - горизонтальная линия (новый слайд)

Используйте между секциями для создания новых слайдов

---

## 📈 Charts & Layouts (API)

⚠️ **Примечание:** Это TypeScript API, не markdown элементы!

**Charts** - программное добавление графиков:
- \`roadmapToChartData(data)\` → Bar chart
- \`roadmapToPriorityChart(data)\` → Pie chart
- \`canvasToPieChart(data)\` → Coverage chart

**Custom Layouts** - специальные макеты:
- \`getRoadmapColumnPositions()\` → 3 колонки (NOW/NEXT/LATER)
- \`getCanvasGridPositions()\` → 3x3 сетка (Business Canvas)
- \`getTwoColumnPositions()\` → 2 колонки

**Shapes** - фигуры и декор:
- \`renderHighlightBox()\` → Info/Warning/Success/Error boxes
- \`renderArrow()\` → Стрелки между элементами
- \`renderDivider()\` → Разделители секций

📚 Смотри \`EXAMPLES.md\` и \`QUICKSTART.md\` для кода

---

## 💡 Best Practices

1. **One idea per slide**
2. **Use visuals** - tables, lists, charts
3. **Keep it simple** - avoid text walls
4. **Test export** - always preview PPTX
5. **Consistent style** - stick to theme

---

## 🎯 Quick Tips

- Use **H2** for slide titles
- Use **lists** instead of paragraphs
- Use **tables** for structured data
- Use **code blocks** for syntax
- Use **blockquotes** for highlights
- Use **emojis** for visual appeal ✨

---

## 📦 Complete Example

**Slide with mixed content:**

## Feature Status

| Feature | Q1 | Q2 |
|---------|----|----|
| Auth | ✅ | ✅ |
| Dashboard | 🚧 | ✅ |

**Next steps:**
1. Complete dashboard
2. Add analytics
3. Launch mobile app

> 🎯 **Goal:** Ship by Q3

**Code sample:**
\`\`\`typescript
const progress = calculateProgress(features)
\`\`\`
`,
        en: `Create a presentation about "{{topic}}".

Parameters:
- Number of slides: {{slideCount}}
- Tone: {{tone}}
- Additional Context: {{additionalContext}}

Output Format:
Return ONLY the raw Markdown content for the slides.
Use "---" to separate slides.
Use "# Title" for slide titles.
Use bullet points, bold text, and other markdown features.
Do not include any conversational text, just the markdown.

IMPORTANT: Follow this formatting guide:
# Presentation Guide

---

## 📝 Text Formatting

**Bold text** - use \`**text**\`
*Italic text* - use \`*text*\`
~~Strikethrough~~ - use \`~~text~~\`
Inline \`code\` - use \\\`code\\\`
Combined: **_bold italic_** - use \`**_text_**\`

---

## 📋 Lists

**Bulleted:**
- Item 1
- Item 2
  - Nested item

**Numbered:**
1. First
2. Second
   1. Sub-item

**Task list:**
- [x] Done
- [ ] Todo

---

## 📊 Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Auth | ✅ Done | High |
| Dashboard | 🚧 WIP | High |
| Analytics | 📋 Plan | Medium |

**Alignment:**
- \`:---\` - left
- \`:---:\` - center
- \`---:\` - right

---

## 💻 Code

**Inline:** use \\\`code\\\`

**Code block:**
\`\`\`javascript
const greet = (name) => {
  console.log(\\\`Hello, \\\${name}!\\\`)
}
\`\`\`

Support: js, ts, python, java, json, css, html

---

## 💬 Blockquotes

> Important note here

> **Pro tip:** Use for key takeaways

**Syntax:** \`> text\`

---

## 🔗 Links

[Link text](https://example.com)

**Syntax:** \`[text](url)\`

**Note:** In PPTX links are shown with URL in parentheses

---

## 🎨 Slide Separators

\`---\` - horizontal line (new slide)

Use between sections to create new slides

---

## 📈 Charts & Layouts (API)

⚠️ **Note:** This is TypeScript API, not markdown elements!

**Charts** - programmatic charts:
- \`roadmapToChartData(data)\` → Bar chart
- \`roadmapToPriorityChart(data)\` → Pie chart
- \`canvasToPieChart(data)\` → Coverage chart

**Custom Layouts** - special layouts:
- \`getRoadmapColumnPositions()\` → 3 columns (NOW/NEXT/LATER)
- \`getCanvasGridPositions()\` → 3x3 grid (Business Canvas)
- \`getTwoColumnPositions()\` → 2 columns

**Shapes** - shapes and decor:
- \`renderHighlightBox()\` → Info/Warning/Success/Error boxes
- \`renderArrow()\` → Arrows between elements
- \`renderDivider()\` → Section dividers

📚 See \`EXAMPLES.md\` and \`QUICKSTART.md\` for code

---

## 💡 Best Practices

1. **One idea per slide**
2. **Use visuals** - tables, lists, charts
3. **Keep it simple** - avoid text walls
4. **Test export** - always preview PPTX
5. **Consistent style** - stick to theme

---

## 🎯 Quick Tips

- Use **H2** for slide titles
- Use **lists** instead of paragraphs
- Use **tables** for structured data
- Use **code blocks** for syntax
- Use **blockquotes** for highlights
- Use **emojis** for visual appeal ✨

---

## 📦 Complete Example

**Slide with mixed content:**

## Feature Status

| Feature | Q1 | Q2 |
|---------|----|----|
| Auth | ✅ | ✅ |
| Dashboard | 🚧 | ✅ |

**Next steps:**
1. Complete dashboard
2. Add analytics
3. Launch mobile app

> 🎯 **Goal:** Ship by Q3

**Code sample:**
\`\`\`typescript
const progress = calculateProgress(features)
\`\`\`
`,
    },
}
