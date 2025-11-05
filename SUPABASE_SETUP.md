# Supabase Setup Instructions

## 1. Применить SQL Schema

1. Открой Supabase Dashboard: https://osnklmllzzachokmryvl.supabase.co
2. Перейди в **SQL Editor**
3. Скопируй содержимое файла `supabase-schema.sql`
4. Вставь в SQL Editor и нажми **RUN**

Это создаст:
- ✅ Таблицу `projects` (для CJM, Business Canvas, Lean Canvas, Roadmap)
- ✅ Таблицу `project_versions` (для истории версий)
- ✅ Триггеры для auto-update `updated_at`
- ✅ Триггеры для auto-versioning при изменениях
- ✅ Индексы для быстрого поиска
- ✅ RLS (Row Level Security) policies

## 2. Проверить Connection

После применения schema:
1. Открой приложение
2. Перейди на страницу **/test-supabase** (я создал тестовую страницу)
3. Нажми кнопки:
   - **Test Connection** - проверит подключение
   - **Create Test Project** - создаст тестовый проект
   - **Load Projects** - загрузит все проекты

## 3. Если всё работает:
- ✅ Connection successful
- ✅ Можно сохранять проекты
- ✅ Версионирование работает автоматически

## Environment Variables (.env уже настроен):
```
VITE_SUPABASE_URL=https://osnklmllzzachokmryvl.supabase.co
VITE_SUPABASE_ANON_KEY=<your-key>
```

## Troubleshooting:

### Если ошибка "relation does not exist":
- Schema не применен → выполни SQL из шага 1

### Если ошибка "permission denied":
- RLS policies не применены → выполни весь SQL из шага 1

### Если ошибка connection:
- Проверь .env файл
- Проверь что Supabase project активен
