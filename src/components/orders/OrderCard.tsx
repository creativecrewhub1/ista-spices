import { Clock, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Order } from '@/data/types'
import { orderStatusConfig } from '@/lib/status'
import { formatCurrency, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'

interface OrderCardProps {
  order: Order
  onOpen: (order: Order) => void
  isLate: boolean
}

export function OrderCard({ order, onOpen, isLate }: OrderCardProps) {
  const status = orderStatusConfig[order.status]
  const itemsSummary = order.items.map((item) => `${item.qty}× ${item.name} (${item.packSize})`).join(', ')

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onOpen(order)}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(order)}
      className="gap-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-1 hover:ring-primary/15 active:translate-y-0 active:shadow-sm"
    >
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-mono text-xs font-medium text-muted-foreground">{order.id}</p>
            <p className="truncate text-sm font-semibold text-foreground">{order.customerName}</p>
          </div>
          <Badge variant="outline" className={status.badgeClass}>
            <span className={cn('mr-1 size-1.5 rounded-full', status.dotClass)} />
            {status.label}
          </Badge>
        </div>

        <p className="line-clamp-1 text-xs text-muted-foreground">{itemsSummary}</p>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden="true" />
            <span className="truncate max-w-[10rem]">{order.address}</span>
          </span>
          <span
            className={cn('flex shrink-0 items-center gap-1 font-medium', isLate && 'text-destructive')}
          >
            <Clock className="size-3.5" aria-hidden="true" />
            ETA {formatTime(order.eta)}
          </span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {order.kind === 'subscription' ? 'Subscription refill' : 'One-time order'}
          </span>
          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(order.total)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
