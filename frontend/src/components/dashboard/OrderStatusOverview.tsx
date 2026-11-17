import { Link } from 'react-router-dom'
import { SectionCard } from './SectionCard'
import { LoadingState, ErrorState } from '@/components/common/QueryState'
import { useTodaySummary } from '@/data/queries'
import { orderStatusConfig } from '@/lib/status'
import type { TodaySummary } from '@/data/types'
import { cn } from '@/lib/utils'

const trackedStatuses: (keyof TodaySummary['statusCounts'])[] = [
  'pending',
  'processing',
  'packed',
  'delivered',
]

export function OrderStatusOverview() {
  const { data, isLoading, error } = useTodaySummary()

  if (isLoading) {
    return (
      <SectionCard title="Orders today">
        <LoadingState />
      </SectionCard>
    )
  }
  if (error) {
    return (
      <SectionCard title="Orders today">
        <ErrorState message={error.message} />
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Orders today"
      action={
        <Link to="/orders" className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      }
    >
      <div className="mb-4 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tabular-nums">{data!.totalOrders}</span>
        <span className="text-xs text-muted-foreground">total orders</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {trackedStatuses.map((status) => {
          const config = orderStatusConfig[status]
          return (
            <div key={status} className="rounded-lg border border-border p-3">
              <span className={cn('mb-1.5 inline-block size-2 rounded-full', config.dotClass)} />
              <p className="font-mono text-lg font-semibold tabular-nums">{data!.statusCounts[status]}</p>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
