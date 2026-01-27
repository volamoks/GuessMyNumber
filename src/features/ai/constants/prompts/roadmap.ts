import type { PromptTemplate } from './types'

export const roadmapPrompts: Record<'generate_roadmap' | 'analyze_roadmap' | 'improve_roadmap', PromptTemplate> = {
    generate_roadmap: {
        ru: `Создай Product Roadmap в формате Now-Next-Later для: {{description}}

Структура JSON:
{
  "title": "название продукта",
  "description": "краткое описание",
  "now": [
    {
      "title": "название фичи",
      "description": "описание",
      "priority": "high" | "medium" | "low",
      "category": "feature" | "bug_fix" | "tech_debt" | "improvement",
      "effort": "small" | "medium" | "large",
      "status": "planning" | "in_progress" | "done"
    }
  ],
  "next": [ /* та же структура */ ],
  "later": [ /* та же структура */ ]
}

Now - текущий квартал (2-4 фичи)
Next - следующий квартал (3-5 фичи)
Later - будущее (5-7 идей)

Верни только JSON без markdown блоков.`,
        en: `Create a Product Roadmap in Now-Next-Later format for: {{description}}

JSON structure:
{
  "title": "product name",
  "description": "brief description",
  "now": [
    {
      "title": "feature title",
      "description": "description",
      "priority": "high" | "medium" | "low",
      "category": "feature" | "bug_fix" | "tech_debt" | "improvement",
      "effort": "small" | "medium" | "large",
      "status": "planning" | "in_progress" | "done"
    }
  ],
  "next": [ /* same structure */ ],
  "later": [ /* same structure */ ]
}

Now - current quarter (2-4 features)
Next - next quarter (3-5 features)
Later - future (5-7 ideas)

Return only JSON without markdown blocks.`,
    },

    analyze_roadmap: {
        ru: `Проанализируй Product Roadmap и предложи улучшения.

Данные Roadmap:
{{data}}

Выполни анализ и предоставь:

1. **Оценка стратегии**:
   - Баланс между Now/Next/Later
   - Приоритезация фичей
   - Соответствие бизнес-целям

2. **Анализ фичей**:
   - Корректность оценки effort
   - Реалистичность сроков (Now/Next/Later)
   - Зависимости между фичами
   - Технический долг vs новые фичи

3. **Рекомендации**:
   - Какие фичи переприоритизировать
   - Что стоит разбить на этапы
   - Quick wins для Now
   - Долгосрочные инвестиции для Later

4. **Риски**:
   - Перегруженные периоды
   - Недооцененные фичи
   - Отсутствующие зависимости

Формат ответа: структурированный текст с четкими разделами и bullet points.`,
        en: `Analyze Product Roadmap and suggest improvements.

Roadmap Data:
{{data}}

Provide analysis:

1. **Strategy Assessment**:
   - Balance between Now/Next/Later
   - Feature prioritization
   - Business goals alignment

2. **Feature Analysis**:
   - Effort estimation accuracy
   - Timeline realism (Now/Next/Later)
   - Dependencies between features
   - Technical debt vs new features

3. **Recommendations**:
   - Which features to reprioritize
   - What to break into phases
   - Quick wins for Now
   - Long-term investments for Later

4. **Risks**:
   - Overloaded periods
   - Underestimated features
   - Missing dependencies

Format: structured text with clear sections and bullet points.`,
    },

    improve_roadmap: {
        ru: `Улучши Product Roadmap на основе анализа и рекомендаций.

Текущие данные Roadmap:
{{data}}

{{analysis}}

Задача:
1. Сохрани структуру Now/Next/Later
2. Переприоритизируй фичи если нужно
3. Разбей крупные фичи на этапы
4. Добавь quick wins
5. Исправь оценки effort и зависимости
6. Добавь детали на основе рекомендаций

Верни ТОЛЬКО улучшенный JSON в той же структуре, без markdown блоков и пояснений.`,
        en: `Improve Product Roadmap based on analysis and recommendations.

Current Roadmap data:
{{data}}

{{analysis}}

Task:
1. Preserve Now/Next/Later structure
2. Reprioritize features if needed
3. Break large features into phases
4. Add quick wins
5. Fix effort estimates and dependencies
6. Add details based on recommendations

Return ONLY improved JSON in the same structure, without markdown blocks or explanations.`,
    },
}
