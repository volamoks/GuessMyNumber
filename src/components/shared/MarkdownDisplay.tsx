import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownDisplayProps {
    content: string
    className?: string
}

export function MarkdownDisplay({ content, className }: MarkdownDisplayProps) {
    return (
        <div className={cn("prose dark:prose-invert max-w-none leading-relaxed", className)}>
            <ReactMarkdown
                components={{
                    // Custom components can be added here if needed (e.g. code blocks highlighting)
                    code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return match ? (
                            <code className={cn("bg-muted p-1 rounded font-mono text-sm", className)} {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm text-primary" {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {content || ""}
            </ReactMarkdown>
        </div>
    )
}
