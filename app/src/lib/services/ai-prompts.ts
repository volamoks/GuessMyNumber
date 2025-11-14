/**
 * AI Prompts Templates
 * Centralized location for all AI prompts with i18n support
 */

export type OperationType =
  | 'generate_cjm'
  | 'generate_business_canvas'
  | 'generate_lean_canvas'
  | 'generate_roadmap'
  | 'analyze_cjm'
  | 'analyze_business_canvas'
  | 'analyze_lean_canvas'
  | 'analyze_roadmap'
  | 'improve_cjm'
  | 'improve_business_canvas'
  | 'improve_lean_canvas'
  | 'improve_roadmap'

export type Language = 'ru' | 'en'

/**
 * Prompt template interface
 */
export interface PromptTemplate {
  ru: string
  en: string
}

/**
 * Get prompt by operation type and language
 */
export function getPrompt(
  operation: OperationType,
  language: Language,
  params?: Record<string, string>
): string {
  const template = PROMPTS[operation][language]

  if (!params) return template

  // Replace placeholders like {{description}} with actual values
  return Object.entries(params).reduce(
    (prompt, [key, value]) => prompt.replace(`{{${key}}}`, value),
    template
  )
}

/**
 * All AI prompts organized by operation
 * Exported for use in AIPromptsStore as default values
 */
export const PROMPTS: Record<OperationType, PromptTemplate> = {
  generate_cjm: {
    ru: 'Создай CJM в JSON без markdown: {{description}}',
    en: 'Create CJM in JSON without markdown: {{description}}',
  },

  generate_business_canvas: {
    ru: `Создай Business Model Canvas в JSON формате для: {{description}}

Структура JSON:
{
  "title": "название продукта/услуги",
  "keyPartners": ["партнер 1", "партнер 2", ...],
  "keyActivities": ["активность 1", "активность 2", ...],
  "keyResources": ["ресурс 1", "ресурс 2", ...],
  "valueProposition": ["ценность 1", "ценность 2", ...],
  "customerRelationships": ["взаимоотношение 1", "взаимоотношение 2", ...],
  "channels": ["канал 1", "канал 2", ...],
  "customerSegments": ["сегмент 1", "сегмент 2", ...],
  "costStructure": ["статья расходов 1", "статья расходов 2", ...],
  "revenueStreams": ["источник дохода 1", "источник дохода 2", ...]
}

Верни только JSON без markdown блоков.`,
    en: `Create a Business Model Canvas in JSON format for: {{description}}

JSON structure:
{
  "title": "product/service name",
  "keyPartners": ["partner 1", "partner 2", ...],
  "keyActivities": ["activity 1", "activity 2", ...],
  "keyResources": ["resource 1", "resource 2", ...],
  "valueProposition": ["value 1", "value 2", ...],
  "customerRelationships": ["relationship 1", "relationship 2", ...],
  "channels": ["channel 1", "channel 2", ...],
  "customerSegments": ["segment 1", "segment 2", ...],
  "costStructure": ["cost 1", "cost 2", ...],
  "revenueStreams": ["revenue stream 1", "revenue stream 2", ...]
}

Return only JSON without markdown blocks.`,
  },

  generate_lean_canvas: {
    ru: `Создай Lean Canvas в JSON формате для: {{description}}

Структура JSON:
{
  "title": "название продукта/услуги",
  "problem": ["проблема 1", "проблема 2", "проблема 3"],
  "solution": ["решение 1", "решение 2", "решение 3"],
  "keyMetrics": ["метрика 1", "метрика 2", ...],
  "uniqueValueProposition": "уникальное ценностное предложение (одна строка)",
  "unfairAdvantage": ["преимущество 1", "преимущество 2", ...],
  "channels": ["канал 1", "канал 2", ...],
  "customerSegments": ["сегмент 1", "сегмент 2", ...],
  "costStructure": ["статья расходов 1", "статья расходов 2", ...],
  "revenueStreams": ["источник дохода 1", "источник дохода 2", ...]
}

Верни только JSON без markdown блоков.`,
    en: `Create a Lean Canvas in JSON format for: {{description}}

JSON structure:
{
  "title": "product/service name",
  "problem": ["problem 1", "problem 2", "problem 3"],
  "solution": ["solution 1", "solution 2", "solution 3"],
  "keyMetrics": ["metric 1", "metric 2", ...],
  "uniqueValueProposition": "unique value proposition (one line)",
  "unfairAdvantage": ["advantage 1", "advantage 2", ...],
  "channels": ["channel 1", "channel 2", ...],
  "customerSegments": ["segment 1", "segment 2", ...],
  "costStructure": ["cost 1", "cost 2", ...],
  "revenueStreams": ["revenue stream 1", "revenue stream 2", ...]
}

Return only JSON without markdown blocks.`,
  },

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

  analyze_cjm: {
    ru: `Проанализируй и предложи улучшения для Customer Journey Map.

Данные CJM:
{{data}}

Выполни глубокий анализ и предоставь:

1. **Общая оценка**:
   - Полнота карты путешествия
   - Качество проработки каждого этапа
   - Связность между этапами

2. **Анализ клиентского опыта**:
   - Критические болевые точки (negatives)
   - Моменты истины (key moments)
   - Эмоциональные пики и провалы (experience)
   - Пробелы в touchpoints

3. **Бизнес-перспектива**:
   - Оценка KPIs и их релевантности
   - Эффективность организационных активностей
   - Технологический стек (достаточность и современность)
   - Зоны ответственности

4. **Конкретные рекомендации по улучшению**:
   - Какие touchpoints добавить
   - Как усилить позитивный опыт
   - Как решить выявленные проблемы
   - Какие идеи из ideasOpportunities приоритизировать
   - Дополнительные метрики для отслеживания

5. **Quick wins** (быстрые улучшения, которые можно внедрить сразу)

6. **Долгосрочные улучшения** (стратегические изменения)

Формат ответа: структурированный текст с четкими разделами и bullet points.`,
    en: `Analyze and suggest improvements for the Customer Journey Map.

CJM Data:
{{data}}

Provide deep analysis:

1. **Overall Assessment**:
   - Completeness of journey map
   - Quality of each stage
   - Coherence between stages

2. **Customer Experience Analysis**:
   - Critical pain points (negatives)
   - Moments of truth
   - Emotional peaks and valleys (experience)
   - Gaps in touchpoints

3. **Business Perspective**:
   - KPI relevance and effectiveness
   - Organizational activities efficiency
   - Technology stack adequacy
   - Responsibility zones

4. **Specific Improvement Recommendations**:
   - Which touchpoints to add
   - How to enhance positive experience
   - How to solve identified problems
   - Which ideasOpportunities to prioritize
   - Additional metrics to track

5. **Quick wins** (immediate improvements)

6. **Long-term improvements** (strategic changes)

Format: structured text with clear sections and bullet points.`,
  },

  analyze_business_canvas: {
    ru: 'Проанализируй Business Canvas: {{data}}',
    en: 'Analyze Business Canvas: {{data}}',
  },

  analyze_lean_canvas: {
    ru: 'Проанализируй Lean Canvas: {{data}}',
    en: 'Analyze Lean Canvas: {{data}}',
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

  improve_cjm: {
    ru: `Улучши Customer Journey Map на основе анализа и рекомендаций.

Текущие данные CJM:
{{data}}

{{analysis}}

Задача:
1. Сохрани структуру и основную логику
2. Дополни недостающие элементы
3. Улучши формулировки
4. Добавь детали на основе рекомендаций
5. Исправь выявленные проблемы

Верни ТОЛЬКО улучшенный JSON в той же структуре, без markdown блоков и пояснений.`,
    en: `Improve Customer Journey Map based on analysis and recommendations.

Current CJM data:
{{data}}

{{analysis}}

Task:
1. Preserve structure and main logic
2. Add missing elements
3. Improve wording
4. Add details based on recommendations
5. Fix identified issues

Return ONLY improved JSON in the same structure, without markdown blocks or explanations.`,
  },

  improve_business_canvas: {
    ru: `Улучши Business Model Canvas на основе анализа и рекомендаций.

Текущие данные Business Canvas:
{{data}}

{{analysis}}

Задача:
1. Сохрани структуру и ключевые блоки
2. Дополни каждый блок релевантными элементами
3. Улучши формулировки для большей конкретности
4. Добавь детали на основе рекомендаций
5. Исправь несоответствия между блоками

Верни ТОЛЬКО улучшенный JSON в той же структуре, без markdown блоков и пояснений.`,
    en: `Improve Business Model Canvas based on analysis and recommendations.

Current Business Canvas data:
{{data}}

{{analysis}}

Task:
1. Preserve structure and key blocks
2. Add relevant elements to each block
3. Improve wording for specificity
4. Add details based on recommendations
5. Fix inconsistencies between blocks

Return ONLY improved JSON in the same structure, without markdown blocks or explanations.`,
  },

  improve_lean_canvas: {
    ru: `Улучши Lean Canvas на основе анализа и рекомендаций.

Текущие данные Lean Canvas:
{{data}}

{{analysis}}

Задача:
1. Сохрани структуру и ключевые блоки
2. Уточни Problem-Solution Fit
3. Конкретизируй метрики и каналы
4. Усиль Unique Value Proposition
5. Добавь детали на основе рекомендаций

Верни ТОЛЬКО улучшенный JSON в той же структуре, без markdown блоков и пояснений.`,
    en: `Improve Lean Canvas based on analysis and recommendations.

Current Lean Canvas data:
{{data}}

{{analysis}}

Task:
1. Preserve structure and key blocks
2. Clarify Problem-Solution Fit
3. Specify metrics and channels
4. Strengthen Unique Value Proposition
5. Add details based on recommendations

Return ONLY improved JSON in the same structure, without markdown blocks or explanations.`,
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
