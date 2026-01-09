interface CanvasBlockProps {
  title: string
  items?: string[]
  content?: string
  className?: string
}

export function CanvasBlock({ title, items, content, className = "" }: CanvasBlockProps) {
  return (
    <div className={`p-4 border rounded-lg bg-card ${className}`}>
      <h3 className="font-semibold mb-2 text-sm">{title}</h3>
      {items ? (
        <ul className="space-y-1 text-sm">
          {items.map((item, i) => (
            <li key={i} className="text-muted-foreground">• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{content}</p>
      )}
    </div>
  )
}
