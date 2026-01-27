import type { PromptTemplate } from './types'

export const cjmPrompts: Record<'generate_cjm' | 'analyze_cjm' | 'improve_cjm', PromptTemplate> = {
   generate_cjm: {
      ru: 'Создай CJM в JSON без markdown: {{description}}',
      en: 'Create CJM in JSON without markdown: {{description}}',
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
}
