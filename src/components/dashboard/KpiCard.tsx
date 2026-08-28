import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  deltaPercent?: number
  tone?: 'primary' | 'accent' | 'success' | 'warning'
}

const toneClasses: Record<NonNullable<KpiCardProps['tone']>, string> = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
}

export function KpiCard({ label, value, icon: Icon, deltaPercent, tone = 'primary' }: KpiCardProps) {
  const isPositive = (deltaPercent ?? 0) >= 0

  return (
    <Card className="gap-2 py-4">
      <CardContent className="flex items-start justify-between gap-3 px-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground md:text-2xl">
            {value}
          </p>
          {deltaPercent !== undefined ? (
            <p
              className={cn(
                'mt-1 flex items-center gap-0.5 text-xs font-medium',
                isPositive ? 'text-success' : 'text-destructive',
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              ) : (
                <ArrowDownRight className="size-3.5" aria-hidden="true" />
              )}
              {Math.abs(deltaPercent)}% vs last week
            </p>
          ) : null}
        </div>
        <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', toneClasses[tone])}>
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  )
}
