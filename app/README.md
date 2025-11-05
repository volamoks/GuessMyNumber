# Product Tools - CJM, Business Canvas, Lean Canvas

Современное веб-приложение для работы с инструментами продуктового менеджмента и бизнес-планирования с интеграцией AI.

## Возможности

- ✅ **Customer Journey Map (CJM)** - Визуализация и анализ пути клиента
- ✅ **Business Model Canvas** - Проектирование бизнес-модели
- ✅ **Lean Canvas** - Быстрое планирование для стартапов
- 🤖 **AI интеграция** - Анализ с помощью Claude или Gemini
- 💾 **Сохранение в базу** - Supabase для хранения проектов
- 📱 **Responsive дизайн** - Работает на всех устройствах
- 🎨 **Современный UI** - Tailwind CSS + shadcn/ui

## Технологии

- **Frontend:** React 18 + TypeScript
- **Build tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Routing:** React Router v6
- **Database:** Supabase
- **AI:** Claude API / Gemini API

## Быстрый старт

### 1. Установка зависимостей

\`\`\`bash
npm install
\`\`\`

### 2. Настройка переменных окружения

Создайте файл \`.env\` на основе \`.env.example\`:

\`\`\`bash
cp .env.example .env
\`\`\`

Заполните переменные:

\`\`\`env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 3. Настройка Supabase

Создайте таблицу в Supabase:

\`\`\`sql
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  type text not null check (type in ('cjm', 'business_canvas', 'lean_canvas')),
  data jsonb not null,
  user_id uuid references auth.users
);

-- Enable Row Level Security
alter table projects enable row level security;

-- Create policy to allow all operations for now (adjust for production)
create policy "Allow all operations"
  on projects for all
  using (true)
  with check (true);
\`\`\`

### 4. Запуск приложения

\`\`\`bash
npm run dev
\`\`\`

Откройте [http://localhost:5173](http://localhost:5173)

## Использование

### 1. Настройка AI

1. Перейдите в раздел **AI Settings**
2. Выберите провайдера (Claude или Gemini)
3. Введите API ключ
4. Нажмите "Сохранить настройки"

### 2. Работа с CJM

1. Перейдите в раздел **Customer Journey Map**
2. Загрузите JSON файл или используйте пример
3. Просмотрите визуализацию пути клиента
4. Нажмите "Анализ с AI" для получения рекомендаций
5. Сохраните проект в базу данных

### 3. Формат JSON для CJM

\`\`\`json
{
  "title": "Название CJM",
  "persona": "Описание персоны",
  "stages": [
    {
      "name": "Этап 1",
      "touchpoints": ["Точка контакта 1"],
      "emotions": ["Эмоция 1"],
      "painPoints": ["Проблема 1"],
      "opportunities": ["Возможность 1"]
    }
  ]
}
\`\`\`

### 4. Формат JSON для Business Canvas

\`\`\`json
{
  "title": "Название проекта",
  "keyPartners": ["Партнёр 1"],
  "keyActivities": ["Активность 1"],
  "keyResources": ["Ресурс 1"],
  "valueProposition": ["Ценность 1"],
  "customerRelationships": ["Отношение 1"],
  "channels": ["Канал 1"],
  "customerSegments": ["Сегмент 1"],
  "costStructure": ["Издержка 1"],
  "revenueStreams": ["Поток дохода 1"]
}
\`\`\`

### 5. Формат JSON для Lean Canvas

\`\`\`json
{
  "title": "Название стартапа",
  "problem": ["Проблема 1"],
  "solution": ["Решение 1"],
  "keyMetrics": ["Метрика 1"],
  "uniqueValueProposition": "УЦП",
  "unfairAdvantage": ["Преимущество 1"],
  "channels": ["Канал 1"],
  "customerSegments": ["Сегмент 1"],
  "costStructure": ["Издержка 1"],
  "revenueStreams": ["Поток дохода 1"]
}
\`\`\`

## Деплой

### Vercel

\`\`\`bash
npm run build
vercel --prod
\`\`\`

Не забудьте добавить переменные окружения в настройках проекта Vercel.

### Netlify

\`\`\`bash
npm run build
netlify deploy --prod --dir=dist
\`\`\`

### Docker

\`\`\`dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
\`\`\`

## Разработка

### Структура проекта

\`\`\`
app/
├── src/
│   ├── components/      # React компоненты
│   │   ├── ui/         # shadcn/ui компоненты
│   │   └── Layout.tsx  # Основной layout
│   ├── pages/          # Страницы приложения
│   │   ├── CJMPage.tsx
│   │   ├── BusinessCanvasPage.tsx
│   │   ├── LeanCanvasPage.tsx
│   │   └── AISettingsPage.tsx
│   ├── lib/            # Утилиты и сервисы
│   │   ├── utils.ts    # Вспомогательные функции
│   │   ├── supabase.ts # Supabase клиент
│   │   └── ai-service.ts # AI интеграция
│   ├── App.tsx         # Главный компонент
│   └── main.tsx        # Точка входа
├── public/             # Статические файлы
└── package.json
\`\`\`

### Добавление нового модуля

1. Создайте новую страницу в \`src/pages/\`
2. Добавьте роут в \`App.tsx\`
3. Добавьте пункт меню в \`Layout.tsx\`
4. Создайте типы данных
5. Добавьте метод анализа в \`ai-service.ts\`

## API Ключи

### Claude (Anthropic)

1. Перейдите на https://console.anthropic.com
2. Создайте API ключ
3. Используется модель: \`claude-3-5-sonnet-20241022\`

### Gemini (Google)

1. Перейдите на https://makersuite.google.com/app/apikey
2. Создайте API ключ
3. Используется модель: \`gemini-pro\`

## Лицензия

MIT

## Автор

Created with ❤️ using Claude Code
