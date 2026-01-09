export const EXAMPLE_ROADMAP = {
  title: "Продуктовая roadmap SaaS платформы",
  description: "Планирование развития платформы для управления проектами на Q1-Q3 2025",
  now: [
    {
      title: "Улучшение мобильного приложения",
      description: "Переработка UI/UX мобильного приложения для iOS и Android",
      priority: "high" as const,
      category: "improvement" as const,
      effort: "large" as const,
      status: "in_progress" as const
    },
    {
      title: "Интеграция с Slack",
      description: "Двусторонняя интеграция с Slack для уведомлений и управления задачами",
      priority: "high" as const,
      category: "feature" as const,
      effort: "medium" as const,
      status: "planning" as const
    },
    {
      title: "Исправление багов с нотификациями",
      description: "Устранение проблем с доставкой push-уведомлений",
      priority: "high" as const,
      category: "bug_fix" as const,
      effort: "small" as const,
      status: "done" as const
    }
  ],
  next: [
    {
      title: "AI-помощник для планирования",
      description: "Интеллектуальный ассистент для автоматического планирования задач",
      priority: "high" as const,
      category: "feature" as const,
      effort: "large" as const,
      status: "planning" as const
    },
    {
      title: "Продвинутая аналитика",
      description: "Dashboard с метриками производительности команды",
      priority: "medium" as const,
      category: "feature" as const,
      effort: "medium" as const,
      status: "planning" as const
    },
    {
      title: "Темная тема",
      description: "Поддержка dark mode во всех интерфейсах",
      priority: "medium" as const,
      category: "improvement" as const,
      effort: "small" as const,
      status: "planning" as const
    },
    {
      title: "Оптимизация производительности",
      description: "Улучшение скорости загрузки на 30%",
      priority: "low" as const,
      category: "tech_debt" as const,
      effort: "medium" as const,
      status: "planning" as const
    }
  ],
  later: [
    {
      title: "Whiteboard для брейнштормингов",
      description: "Collaborative whiteboard для визуального планирования",
      priority: "medium" as const,
      category: "feature" as const,
      effort: "large" as const,
      status: "planning" as const
    },
    {
      title: "Видеозвонки в приложении",
      description: "Встроенные видеоконференции без внешних сервисов",
      priority: "low" as const,
      category: "feature" as const,
      effort: "large" as const,
      status: "planning" as const
    },
    {
      title: "Маркетплейс интеграций",
      description: "Платформа для сторонних разработчиков плагинов",
      priority: "low" as const,
      category: "feature" as const,
      effort: "large" as const,
      status: "planning" as const
    },
    {
      title: "Офлайн-режим",
      description: "Работа приложения без интернета с синхронизацией",
      priority: "medium" as const,
      category: "feature" as const,
      effort: "large" as const,
      status: "planning" as const
    },
    {
      title: "API v2",
      description: "Новая версия API с GraphQL поддержкой",
      priority: "low" as const,
      category: "tech_debt" as const,
      effort: "large" as const,
      status: "planning" as const
    }
  ]
}
