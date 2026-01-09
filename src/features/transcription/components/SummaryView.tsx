/**
 * Summary View Component
 * Displays AI-generated detailed summary with timeline, quotes, and action items
 */

import { useState } from 'react'
import {
    Copy, Check, Lightbulb, CheckCircle, MessageSquare,
    Clock, Quote, HelpCircle, AlertTriangle, Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { TranscriptionSummary } from '../types'

interface SummaryViewProps {
    summary: TranscriptionSummary
}

export function SummaryView({ summary }: SummaryViewProps) {
    const [copied, setCopied] = useState(false)

    const handleCopyMarkdown = async () => {
        const actionItemsText = summary.actionItems
            .map(a => typeof a === 'string' ? `- [ ] ${a}` : `- [ ] ${a.task}${a.assignee ? ` (@${a.assignee})` : ''}${a.deadline ? ` — ${a.deadline}` : ''}`)
            .join('\n')

        const timelineText = summary.timeline?.length
            ? `### Хронология\n${summary.timeline.map(t => `- **${t.topic}**: ${t.summary}`).join('\n')}\n\n`
            : ''

        const quotesText = summary.quotes?.length
            ? `### Ключевые цитаты\n${summary.quotes.map(q => `> "${q}"`).join('\n\n')}\n\n`
            : ''

        const questionsText = summary.questions?.length
            ? `### Обсуждаемые вопросы\n${summary.questions.map(q => `- ${q}`).join('\n')}\n\n`
            : ''

        const unresolvedText = summary.unresolvedItems?.length
            ? `### Нерешённые вопросы\n${summary.unresolvedItems.map(u => `- ⚠️ ${u}`).join('\n')}\n\n`
            : ''

        const markdown = `## Резюме встречи

${summary.summary}

${timelineText}### Ключевые моменты
${summary.keyPoints.map(p => `- ${p}`).join('\n')}

${quotesText}### Задачи
${actionItemsText}

### Принятые решения
${summary.decisions.map(d => `- ✓ ${d}`).join('\n')}

${questionsText}${unresolvedText}${summary.participants?.length ? `### Участники\n${summary.participants.join(', ')}` : ''}`

        await navigator.clipboard.writeText(markdown)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Helper to render action item (supports both string and object format)
    const renderActionItem = (item: string | { task: string; assignee?: string; deadline?: string }, i: number) => {
        if (typeof item === 'string') {
            return (
                <li key={i} className="text-sm flex items-start gap-2">
                    <input type="checkbox" className="mt-1 rounded" />
                    {item}
                </li>
            )
        }
        return (
            <li key={i} className="text-sm flex items-start gap-2">
                <input type="checkbox" className="mt-1 rounded" />
                <div>
                    <span>{item.task}</span>
                    {(item.assignee || item.deadline) && (
                        <span className="text-muted-foreground ml-2 text-xs">
                            {item.assignee && `@${item.assignee}`}
                            {item.assignee && item.deadline && ' • '}
                            {item.deadline && item.deadline}
                        </span>
                    )}
                </div>
            </li>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Детальный анализ встречи</h3>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyMarkdown}
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 mr-1" />
                            Скопировано
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4 mr-1" />
                            Копировать MD
                        </>
                    )}
                </Button>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                        <h4 className="font-medium text-sm text-primary mb-1">Резюме</h4>
                        <p className="text-sm leading-relaxed">{summary.summary}</p>
                    </div>
                </div>
            </div>

            {/* Participants */}
            {summary.participants && summary.participants.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Участники: {summary.participants.join(', ')}</span>
                </div>
            )}

            {/* Timeline */}
            {summary.timeline && summary.timeline.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-orange-500" />
                        <h4 className="font-medium text-sm">Хронология встречи</h4>
                    </div>
                    <div className="space-y-3">
                        {summary.timeline.map((item, i) => (
                            <div key={i} className="border-l-2 border-orange-200 pl-3">
                                <p className="text-sm font-medium">{item.topic}</p>
                                <p className="text-sm text-muted-foreground">{item.summary}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Key Points */}
            {summary.keyPoints.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <h4 className="font-medium text-sm">Ключевые моменты</h4>
                    </div>
                    <ul className="space-y-2">
                        {summary.keyPoints.map((point, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-yellow-500">•</span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Quotes */}
            {summary.quotes && summary.quotes.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Quote className="h-4 w-4 text-purple-500" />
                        <h4 className="font-medium text-sm">Ключевые цитаты</h4>
                    </div>
                    <div className="space-y-2">
                        {summary.quotes.map((quote, i) => (
                            <blockquote key={i} className="text-sm italic border-l-2 border-purple-300 pl-3 text-muted-foreground">
                                "{quote}"
                            </blockquote>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Items */}
            {summary.actionItems.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <h4 className="font-medium text-sm">Задачи ({summary.actionItems.length})</h4>
                    </div>
                    <ul className="space-y-2">
                        {summary.actionItems.map((item, i) => renderActionItem(item, i))}
                    </ul>
                </div>
            )}

            {/* Decisions */}
            {summary.decisions.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Check className="h-4 w-4 text-blue-500" />
                        <h4 className="font-medium text-sm">Принятые решения</h4>
                    </div>
                    <ul className="space-y-2">
                        {summary.decisions.map((decision, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-blue-500">✓</span>
                                {decision}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Questions Discussed */}
            {summary.questions && summary.questions.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <HelpCircle className="h-4 w-4 text-cyan-500" />
                        <h4 className="font-medium text-sm">Обсуждаемые вопросы</h4>
                    </div>
                    <ul className="space-y-2">
                        {summary.questions.map((q, i) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-cyan-500">?</span>
                                {q}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Unresolved Items */}
            {summary.unresolvedItems && summary.unresolvedItems.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <h4 className="font-medium text-sm text-amber-700 dark:text-amber-400">Нерешённые вопросы</h4>
                    </div>
                    <ul className="space-y-2">
                        {summary.unresolvedItems.map((item, i) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-amber-700 dark:text-amber-400">
                                <span>⚠️</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
