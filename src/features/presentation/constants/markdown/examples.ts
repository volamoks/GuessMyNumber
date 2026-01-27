export const MARKDOWN_FULL_EXAMPLE = `# Документация проекта

## Введение

Это **пример** документа с использованием *всех* возможностей Markdown.
Обратите внимание на \`автоматическую стилизацию\`.

---

## Установка

### Требования

- Node.js версии **22.x** или выше
- npm или pnpm
- Git

### Шаги установки

1. Клонируйте репозиторий:
   \`\`\`bash
   git clone https://github.com/user/project.git
   cd project
   \`\`\`

2. Установите зависимости:
   \`\`\`bash
   npm install
   \`\`\`

3. Запустите проект:
   \`\`\`bash
   npm run dev
   \`\`\`

---

## Конфигурация

| Переменная | Тип | По умолчанию | Описание |
|:-----------|:---:|:------------:|:---------|
| \`PORT\` | number | 3000 | Порт сервера |
| \`DEBUG\` | boolean | false | Режим отладки |
| \`API_URL\` | string | — | URL API |

---

## API Reference

### \`fetchData(url)\`

Асинхронная функция для получения данных.

\`\`\`typescript
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

async function fetchData<T>(
  url: string,
  options?: FetchOptions
): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(\\\`HTTP error! status: \\\${response.status}\\\`);
  }
  return response.json();
}
\`\`\`

> **Примечание:** Функция автоматически парсит JSON ответ.

---

## Задачи

- [x] Базовая структура
- [x] Настройка TypeScript
- [x] Добавление линтинга
- [ ] Написание unit-тестов
- [ ] E2E тестирование
- [ ] CI/CD пайплайн

---

## Полезные ссылки

- [Официальная документация](https://docs.example.com)
- [GitHub репозиторий](https://github.com/user/project)
- [Отчёты об ошибках](https://github.com/user/project/issues)

---

## Горячие клавиши

| Действие | Комбинация |
|----------|------------|
| Сохранить | <kbd>Ctrl</kbd> + <kbd>S</kbd> |
| Копировать | <kbd>Ctrl</kbd> + <kbd>C</kbd> |
| Вставить | <kbd>Ctrl</kbd> + <kbd>V</kbd> |
| Отменить | <kbd>Ctrl</kbd> + <kbd>Z</kbd> |

---

<details>
<summary>Дополнительная информация</summary>

### Архитектура

\`\`\`mermaid
flowchart TD
    UI[React] --> API[Backend]
    API --> DB[(Database)]
\`\`\`

Проект использует:
- **React 19** — UI библиотека
- **TypeScript** — типизация
- **Zustand** — state management
- **Tailwind CSS** — стилизация

</details>

---

*Последнее обновление: \${new Date().toLocaleDateString('ru-RU')}*
`

export const MARKDOWN_CHEATSHEET = `# Presentation Guide

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

## 📊 Charts & Diagrams
 
**Diagrams (Mermaid):**
\`\`\`mermaid
graph TD
    A[Start] --> B{Is it?}
    B -- Yes --> C[OK]
    C --> D[Rethink]
    D --> B
    B -- No --> E[End]
\`\`\`

\`\`\`mermaid
sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!
    Alice-)John: See you later!
\`\`\`

**Roadmap:**
\`\`\`roadmap
{
  "now": [{ "title": "MVP", "priority": "high" }],
    "next": [{ "title": "Scale", "priority": "medium" }],
      "later": [{ "title": "AI", "priority": "low" }]
}
\`\`\`

**Canvas (Business Model / Lean / CJM):**
\`\`\`canvas
{
  "type": "business_model_canvas",
    "keyPartners": ["Suppliers"],
      "keyActivities": ["Production"],
        "valueProposition": ["Innovation"],
          "customerRelationships": ["Self-service"],
            "customerSegments": ["Mass market"],
              "keyResources": ["Intellectual Property"],
                "channels": ["Web"],
                  "costStructure": ["Fixed costs"],
                    "revenueStreams": ["Sales"]
}
\`\`\`

**Charts (API Only):**
Программное добавление графиков доступно через TypeScript API.

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
`
