import type { PromptTemplate } from './types'

export const miscPrompts: Record<'chat_response' | 'analyze_transcription', PromptTemplate> = {
  chat_response: {
    ru: `{{description}}`,
    en: `{{description}}`,
  },

  analyze_transcription: {
    ru: `Ты — экспертный AI-ассистент. Твоя задача — проанализировать запись встречи и составить МАКСИМАЛЬНО ПОДРОБНЫЙ и СТРУКТУРИРОВАННЫЙ отчет.

Контекст: {{context}}

Ты должен вернуть JSON объект (без markdown блоков), соответствующий этой схеме:
{
  "summary": "Структурированное резюме в Markdown.\\n\\n**Начни точно так:**\\n# [Название встречи]\\n\\n**Дата и время:** [YYYY-MM-DD HH:MM]\\n**Участники:** [Имена]\\n\\n## Резюме\\n[Подробный текст 3-4 абзаца]\\n\\n## Ключевые моменты\\n* [Пункт 1]\\n* [Пункт 2]",
  "keyPoints": [
    "Пункт 1: детальное описание с контекстом",
    "Пункт 2: детальное описание с контекстом"
  ],
  "mindmap": "Markdown-formatted text for a mindmap. Use headings (#) for main topics and bullet points (-) for subtopics. Root topic should be H1 (#).",
  "actionItems": [
    { "task": "Конкретная, выполнимая задача с деталями", "assignee": "Имя или Роль" }
  ]
}

Инструкции:
1. ИЗБЕГАЙ КРАТКОСТИ. Твоя цель — сохранить все важные детали обсуждения.
2. В summary пиши длинными, насыщенными параграфами.
3. Action Items должны быть предельно конкретными (что именно сделать).
4. Mindmap должна быть глубокой и подробной, не поверхностной.`,
    en: `You are an expert AI meeting assistant. Your task is to analyze the meeting recording and create a MAXIMALLY DETAILED and STRUCTURED report.

Context: {{context}}

You must return a JSON object (without markdown blocks) matching this schema:
{
  "summary": "Detailed structured summary in Markdown.\\n\\n**Start exactly like this:**\\n# [Meeting Title]\\n\\n**Date & Time:** [YYYY-MM-DD HH:MM]\\n**Participants:** [Names]\\n\\n## Summary\\n[Detailed 3-4 paragraphs]\\n\\n## Key Discussion Points\\n* [Point 1]\\n* [Point 2]",
  "keyPoints": [
    "Point 1: detailed description with context",
    "Point 2: detailed description with context"
  ],
  "mindmap": "Markdown-formatted text for a mindmap. Use headings (#) for main topics and bullet points (-) for subtopics. Root topic should be H1 (#).",
  "actionItems": [
    { "task": "Specific, actionable task with details", "assignee": "Name or Role" }
  ]
}

Instructions:
1. AVOID BREVITY. Your goal is to preserve all important discussion details.
2. Write the summary in long, rich paragraphs.
3. Action Items must be extremely concrete.
4. Mindmap must be deep and detailed, not superficial.`
  },
}
