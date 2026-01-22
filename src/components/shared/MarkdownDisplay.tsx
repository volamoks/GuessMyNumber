import ReactMarkdown from 'react-markdown'
import { cn } from '@/lib/utils'

interface MarkdownDisplayProps {
    content: string
    className?: string
}

export function MarkdownDisplay({ content, className }: MarkdownDisplayProps) {
    return (
        <div className={cn("w-full leading-relaxed break-words text-base", className)}>
            <ReactMarkdown
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-6 mb-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-xl font-bold mt-4 mb-2" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 text-base leading-relaxed" {...props} />,
                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
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
