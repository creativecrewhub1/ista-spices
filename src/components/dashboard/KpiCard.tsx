import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  /** What the figure covers, e.g. "This calendar month". */
  caption?: string
  deltaPercent?: number
  /** Names the period the delta compares against — a delta with no stated
   *  baseline is unreadable, so callers pass this alongside deltaPercent. */
  deltaLabel?: string
  tone?: 'primary' | 'accent' | 'success' | 'warning'
}

// Mini SVG Sparkline curve matching the REDISH dashboard design
function SparklineWave({ color = '#EA580C' }: { color?: string }) {
  return (
    <svg className="w-20 h-10 overflow-visible" viewBox="0 0 100 40">
      <defs>
        <linearGradient id={`sparkline-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d="M0 30 Q 15 10, 35 22 T 70 8 T 100 18 L 100 40 L 0 40 Z"
        fill={`url(#sparkline-grad-${color.replace('#', '')})`}
      />
      <path
        d="M0 30 Q 15 10, 35 22 T 70 8 T 100 18"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

const toneStyles: Record<NonNullable<KpiCardProps['tone']>, { 
  badgeBg: string; 
  iconColor: string; 
  sparkColor: string;
}> = {
  primary: { 
    badgeBg: 'bg-orange-100/70 text-orange-600', 
    iconColor: 'text-orange-600',
    sparkColor: '#EA580C'
  },
  accent: { 
    badgeBg: 'bg-amber-100/70 text-amber-700', 
    iconColor: 'text-amber-700',
    sparkColor: '#D97706'
  },
  success: { 
    badgeBg: 'bg-emerald-100/70 text-emerald-700', 
    iconColor: 'text-emerald-700',
    sparkColor: '#10B981'
  },
  warning: { 
    badgeBg: 'bg-rose-100/70 text-rose-700', 
    iconColor: 'text-rose-700',
    sparkColor: '#F43F5E'
  },
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  caption,
  deltaPercent,
  deltaLabel,
  tone = 'primary',
}: KpiCardProps) {
  const isPositive = (deltaPercent ?? 0) >= 0
  const style = toneStyles[tone]

  return (
    <Card className="group relative overflow-hidden rounded-3xl border border-orange-100/70 bg-white p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-0">
        
        {/* Top Header: Label & Icon Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
          <span className={cn('flex size-8.5 items-center justify-center rounded-xl transition-transform group-hover:scale-110', style.badgeBg)}>
            <Icon className={cn('size-4.5', style.iconColor)} aria-hidden="true" />
          </span>
        </div>

        {/* Value & REDISH Style Sparkline Wave */}
        <div className="flex items-end justify-between gap-3 pt-1">
          <div className="space-y-1">
            <p className="font-display text-2xl sm:text-3xl font-black tabular-nums text-slate-900 tracking-tight">
              {value}
            </p>
            {deltaPercent !== undefined ? (
              <p
                className={cn(
                  'flex items-center gap-0.5 text-xs font-bold',
                  isPositive ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="size-3.5 stroke-[3]" aria-hidden="true" />
                ) : (
                  <ArrowDownRight className="size-3.5 stroke-[3]" aria-hidden="true" />
                )}
                <span>
                  {Math.abs(deltaPercent)}%{deltaLabel ? ` ${deltaLabel}` : ''}
                </span>
              </p>
            ) : caption ? (
              <p className="text-[11px] font-semibold text-slate-400">{caption}</p>
            ) : null}
          </div>

          {/* Mini Sparkline Chart Wave (Matching REDISH) */}
          <div className="shrink-0 pb-1">
            <SparklineWave color={style.sparkColor} />
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
