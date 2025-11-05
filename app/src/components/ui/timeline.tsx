import * as React from 'react'
import { cn } from '@/lib/utils'

interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          orientation === 'horizontal' ? 'flex gap-0' : 'flex flex-col gap-4',
          className
        )}
        {...props}
      />
    )
  }
)
Timeline.displayName = 'Timeline'

interface TimelineItemProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'completed' | 'current' | 'upcoming'
  isLast?: boolean
}

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ className, status = 'upcoming', isLast = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative flex flex-col items-center flex-1', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TimelineItem.displayName = 'TimelineItem'

interface TimelineDotProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'completed' | 'current' | 'upcoming'
}

const TimelineDot = React.forwardRef<HTMLDivElement, TimelineDotProps>(
  ({ className, status = 'upcoming', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-background transition-all',
          status === 'completed' && 'bg-green-500',
          status === 'current' && 'bg-blue-500 ring-4 ring-blue-500/20 scale-110',
          status === 'upcoming' && 'bg-muted',
          className
        )}
        {...props}
      />
    )
  }
)
TimelineDot.displayName = 'TimelineDot'

interface TimelineConnectorProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: 'completed' | 'current' | 'upcoming'
}

const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ className, status = 'upcoming', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute top-5 left-[50%] right-[-50%] h-1 -translate-y-1/2',
          status === 'completed' && 'bg-green-500',
          status === 'current' && 'bg-gradient-to-r from-green-500 to-blue-500',
          status === 'upcoming' && 'bg-muted',
          className
        )}
        {...props}
      />
    )
  }
)
TimelineConnector.displayName = 'TimelineConnector'

interface TimelineContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('mt-4 text-center space-y-2', className)}
        {...props}
      />
    )
  }
)
TimelineContent.displayName = 'TimelineContent'

const TimelineTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold text-sm leading-none', className)}
    {...props}
  />
))
TimelineTitle.displayName = 'TimelineTitle'

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs text-muted-foreground', className)}
    {...props}
  />
))
TimelineDescription.displayName = 'TimelineDescription'

export {
  Timeline,
  TimelineItem,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineTitle,
  TimelineDescription,
}
