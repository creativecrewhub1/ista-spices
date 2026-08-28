import { AlertTriangle, Clock, PackageX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionCard } from './SectionCard'
import { products, orders } from '@/data/mock-data'
import { capacityLevel } from '@/lib/status'
import { formatTime } from '@/lib/format'
import { DEMO_NOW } from '@/lib/demo-clock'

interface AttentionItem {
  id: string
  icon: typeof AlertTriangle
  text: string
  meta: string
  tone: 'destructive' | 'warning'
  to: string
}

export function NeedsAttention() {
  const lowStockItems: AttentionItem[] = products
    .filter((item) => item.isActive && capacityLevel(item.unitsPackedThisBatch, item.batchCapacity) === 'low')
    .map((item) => ({
      id: `stock-${item.id}`,
      icon: PackageX,
      text: `${item.name} is running low on stock`,
      meta: `${item.unitsPackedThisBatch}/${item.batchCapacity} units in hand`,
      tone: 'warning',
      to: '/inventory',
    }))

  const delayedOrders: AttentionItem[] = orders
    .filter((order) => {
      if (order.status === 'delivered' || order.status === 'cancelled') return false
      return new Date(order.eta).getTime() < DEMO_NOW.getTime()
    })
    .map((order) => ({
      id: `order-${order.id}`,
      icon: Clock,
      text: `${order.id} for ${order.customerName} is past ETA`,
      meta: `Expected by ${formatTime(order.eta)}`,
      tone: 'destructive',
      to: '/orders',
    }))

  const items = [...delayedOrders, ...lowStockItems]

  return (
    <SectionCard title="Needs attention">
      {items.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">All clear — nothing needs action right now.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {items.map(({ id, icon: Icon, text, meta, tone, to }) => (
            <li key={id}>
              <Link
                to={to}
                className="flex items-start gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-muted"
              >
                <span
                  className={
                    tone === 'destructive'
                      ? 'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive'
                      : 'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning'
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">{text}</span>
                  <span className="block text-xs text-muted-foreground">{meta}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
