/**
 * MARKDOWN SYNTAX RULES & EXAMPLES
 * =================================
 * Все эти правила автоматически стилизуются через класс "prose"
 */

export const MARKDOWN_RULES = {
  // === ЗАГОЛОВКИ ===
  headings: {
    h1: {
      syntax: '# Заголовок первого уровня',
      description: 'Главный заголовок документа. Большой размер, жирный, с нижней линией.',
      example: '# Название документа',
    },
    h2: {
      syntax: '## Заголовок второго уровня',
      description: 'Подзаголовок секции. С тонкой нижней линией.',
      example: '## Раздел документа',
    },
    h3: {
      syntax: '### Заголовок третьего уровня',
      description: 'Подраздел. Без линии.',
      example: '### Подраздел',
    },
    h4: {
      syntax: '#### Заголовок четвертого уровня',
      description: 'Мелкий заголовок.',
      example: '#### Детали',
    },
    h5: {
      syntax: '##### Заголовок пятого уровня',
      description: 'Очень мелкий заголовок.',
      example: '##### Примечание',
    },
    h6: {
      syntax: '###### Заголовок шестого уровня',
      description: 'Самый мелкий заголовок. Серый цвет.',
      example: '###### Сноска',
    },
  },

  // === ФОРМАТИРОВАНИЕ ТЕКСТА ===
  textFormatting: {
    bold: {
      syntax: '**жирный текст** или __жирный текст__',
      description: 'Выделение важной информации.',
      example: '**Важно:** Обратите внимание',
    },
    italic: {
      syntax: '*курсив* или _курсив_',
      description: 'Акцент или термин.',
      example: '*термин* означает...',
    },
    boldItalic: {
      syntax: '***жирный курсив***',
      description: 'Очень сильное выделение.',
      example: '***Критически важно!***',
    },
    strikethrough: {
      syntax: '~~зачёркнутый~~',
      description: 'Удалённый или устаревший текст.',
      example: '~~старая цена~~ новая цена',
    },
    code: {
      syntax: '`код`',
      description: 'Inline код. Красный цвет, серый фон.',
      example: 'Используйте функцию `useState()`',
    },
    highlight: {
      syntax: '<mark>выделенный</mark>',
      description: 'Жёлтый маркер.',
      example: '<mark>Запомнить!</mark>',
    },
  },

  // === СПИСКИ ===
  lists: {
    unordered: {
      syntax: `- Первый пункт
- Второй пункт
- Третий пункт`,
      description: 'Маркированный список. Можно использовать - или *',
      example: `- React
- Vue
- Angular`,
    },
    ordered: {
      syntax: `1. Первый шаг
2. Второй шаг
3. Третий шаг`,
      description: 'Нумерованный список.',
      example: `1. Установить Node.js
2. Запустить npm install
3. Запустить npm run dev`,
    },
    nested: {
      syntax: `- Основной пункт
  - Вложенный пункт
    - Ещё глубже
  - Второй вложенный`,
      description: 'Вложенные списки (2 пробела для вложения).',
      example: `- Frontend
  - React
    - Next.js
    - Remix
  - Vue
- Backend
  - Node.js
  - Python`,
    },
    taskList: {
      syntax: `- [ ] Не выполнено
- [x] Выполнено
- [ ] Ещё задача`,
      description: 'Список задач с чекбоксами.',
      example: `- [x] Создать проект
- [x] Настроить ESLint
- [ ] Написать тесты
- [ ] Деплой`,
    },
  },

  // === ТАБЛИЦЫ ===
  tables: {
    basic: {
      syntax: `| Заголовок 1 | Заголовок 2 | Заголовок 3 |
|------------|------------|------------|
| Ячейка 1   | Ячейка 2   | Ячейка 3   |
| Ячейка 4   | Ячейка 5   | Ячейка 6   |`,
      description: 'Таблица с заголовком и zebra striping (чередование цвета строк).',
      example: `| Компонент | Версия | Размер |
|-----------|--------|--------|
| React     | 19.1   | 45kb   |
| Vue       | 3.4    | 32kb   |
| Angular   | 18     | 130kb  |`,
    },
    aligned: {
      syntax: `| Лево | Центр | Право |
|:-----|:-----:|------:|
| L    |   C   |     R |`,
      description: 'Выравнивание: :--- (лево), :---: (центр), ---: (право)',
      example: `| Продукт | Количество | Цена |
|:--------|:----------:|-----:|
| Яблоки  |     10     | 150₽ |
| Бананы  |      5     |  80₽ |`,
    },
  },

  // === КОД ===
  code: {
    inline: {
      syntax: '`код в строке`',
      description: 'Короткий код в тексте.',
      example: 'Установите `pnpm` командой `npm i -g pnpm`',
    },
    block: {
      syntax: `\`\`\`javascript
const greeting = "Hello";
console.log(greeting);
\`\`\``,
      description: 'Блок кода с указанием языка. Тёмный фон.',
      example: `\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const fetchUser = async (id: number): Promise<User> => {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
};
\`\`\``,
    },
    languages: {
      description: 'Поддерживаемые языки для блоков кода:',
      list: [
        'javascript', 'typescript', 'jsx', 'tsx',
        'python', 'java', 'csharp', 'cpp',
        'html', 'css', 'scss', 'json',
        'sql', 'bash', 'shell', 'yaml',
        'markdown', 'xml', 'graphql', 'rust',
      ],
    },
  },

  // === ЦИТАТЫ ===
  blockquotes: {
    simple: {
      syntax: `> Это цитата.
> Она может быть многострочной.`,
      description: 'Цитата с фиолетовой левой полосой и серым фоном.',
      example: `> "Любая достаточно продвинутая технология
> неотличима от магии."
> — Артур Кларк`,
    },
    nested: {
      syntax: `> Внешняя цитата
>> Вложенная цитата`,
      description: 'Вложенные цитаты.',
      example: `> Пользователь спросил:
>> Как установить React?
> Ответ: npm create vite@latest`,
    },
  },

  // === ССЫЛКИ И ИЗОБРАЖЕНИЯ ===
  links: {
    inline: {
      syntax: '[текст ссылки](URL)',
      description: 'Ссылка с фиолетовым цветом и подчёркиванием.',
      example: '[React Documentation](https://react.dev)',
    },
    withTitle: {
      syntax: '[текст](URL "заголовок")',
      description: 'Ссылка с всплывающей подсказкой.',
      example: '[GitHub](https://github.com "Перейти на GitHub")',
    },
    image: {
      syntax: '![alt текст](URL изображения)',
      description: 'Изображение с рамкой и скруглёнными углами.',
      example: '![Logo](./logo.png)',
    },
    imageWithLink: {
      syntax: '[![alt](image-url)](link-url)',
      description: 'Кликабельное изображение.',
      example: '[![React Logo](./react.png)](https://react.dev)',
    },
  },

  // === РАЗДЕЛИТЕЛИ ===
  dividers: {
    horizontal: {
      syntax: '---  или  ***  или  ___',
      description: 'Горизонтальная линия для разделения секций.',
      example: `Первая секция

---

Вторая секция`,
    },
  },

  // === ДОПОЛНИТЕЛЬНЫЕ ЭЛЕМЕНТЫ ===
  advanced: {
    details: {
      syntax: `<details>
<summary>Нажмите чтобы раскрыть</summary>

Скрытый контент здесь...

</details>`,
      description: 'Сворачиваемый блок (спойлер).',
      example: `<details>
<summary>Показать решение</summary>

\`\`\`javascript
const solution = 42;
\`\`\`

</details>`,
    },
    keyboard: {
      syntax: '<kbd>Ctrl</kbd> + <kbd>C</kbd>',
      description: 'Клавиша клавиатуры.',
      example: 'Нажмите <kbd>Ctrl</kbd> + <kbd>S</kbd> для сохранения',
    },
    footnote: {
      syntax: `Текст с сноской[^1].

[^1]: Текст сноски.`,
      description: 'Сноска внизу документа.',
      example: `React[^1] — это библиотека для UI.

[^1]: Создана Facebook в 2013 году.`,
    },
  },
} as const

/**
 * Пример полного документа с использованием всех правил
 */
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
    throw new Error(\`HTTP error! status: \${response.status}\`);
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

Проект использует:
- **React 19** — UI библиотека
- **TypeScript** — типизация
- **Zustand** — state management
- **Tailwind CSS** — стилизация

</details>

---

*Последнее обновление: ${new Date().toLocaleDateString('ru-RU')}*
`

/**
 * Краткая шпаргалка для быстрого доступа
 */
export const MARKDOWN_CHEATSHEET = `
# Markdown Шпаргалка

## Заголовки
\`# H1\` | \`## H2\` | \`### H3\` | \`#### H4\` | \`##### H5\` | \`###### H6\`

## Текст
\`**жирный**\` | \`*курсив*\` | \`~~зачёркнутый~~\` | \`\\\`код\\\`\`

## Списки
\`- элемент\` — маркированный
\`1. элемент\` — нумерованный
\`- [ ] задача\` — чекбокс

## Ссылки/Изображения
\`[текст](url)\` — ссылка
\`![alt](url)\` — изображение

## Цитаты
\`> цитата\`

## Код
\\\`\\\`\\\`язык
код
\\\`\\\`\\\`

## Таблицы
\`| Заголовок | Заголовок |\`
\`|-----------|-----------||\`
\`| Ячейка    | Ячейка    |\`

## Разделитель
\`---\`

## Дополнительно
\`<kbd>Key</kbd>\` — клавиша
\`<mark>выделение</mark>\` — маркер
\`<details><summary>...</summary>...</details>\` — спойлер
`
