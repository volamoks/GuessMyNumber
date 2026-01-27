import type { PromptTemplate } from './types'

export const canvasPrompts: Record<
    | 'generate_business_canvas'
    | 'generate_lean_canvas'
    | 'analyze_business_canvas'
    | 'analyze_lean_canvas'
    | 'improve_business_canvas'
    | 'improve_lean_canvas',
    PromptTemplate
> = {
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

    analyze_business_canvas: {
        ru: 'Проанализируй Business Canvas: {{data}}',
        en: 'Analyze Business Canvas: {{data}}',
    },

    analyze_lean_canvas: {
        ru: 'Проанализируй Lean Canvas: {{data}}',
        en: 'Analyze Lean Canvas: {{data}}',
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
}
