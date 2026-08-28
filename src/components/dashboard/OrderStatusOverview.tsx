import { Link } from 'react-router-dom'
import { SectionCard } from './SectionCard'
import { orders } from '@/data/mock-data'
import { orderStatusConfig, type OrderStatus } from '@/lib/status'
import { DEMO_TODAY } from '@/lib/demo-clock'
import { cn } from '@/lib/utils'

const trackedStatuses: OrderStatus[] = ['pending', 'processing', 'packed', 'delivered']

export function OrderStatusOverview() {
  const todaysOrders = orders.filter((order) => order.placedAt.startsWith(DEMO_TODAY))
  const total = todaysOrders.length
  const counts = trackedStatuses.map((status) => ({
    status,
    count: todaysOrders.filter((order) => order.status === status).length,
  }))

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
        <span className="font-mono text-2xl font-semibold tabular-nums">{total}</span>
        <span className="text-xs text-muted-foreground">total orders</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {counts.map(({ status, count }) => {
          const config = orderStatusConfig[status]
          return (
            <div key={status} className="rounded-lg border border-border p-3">
              <span className={cn('mb-1.5 inline-block size-2 rounded-full', config.dotClass)} />
              <p className="font-mono text-lg font-semibold tabular-nums">{count}</p>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
