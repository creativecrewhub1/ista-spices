import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  action?: ReactNode
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = 'left', action, className }: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className={cn('flex flex-col gap-2', align === 'center' && 'items-center')}>
        {eyebrow ? (
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-primary">{eyebrow}</span>
        ) : null}
        <h2 className="font-display text-3xl font-medium leading-tight text-foreground sm:text-4xl">{title}</h2>
        {description ? (
          <p className={cn('max-w-xl text-muted-foreground', align === 'center' && 'mx-auto')}>{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
