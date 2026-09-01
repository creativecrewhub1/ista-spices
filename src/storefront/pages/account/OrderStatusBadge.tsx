import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { MockOrder } from '../../data/account'

const CONFIG: Record<MockOrder['status'], { label: string; className: string }> = {
  processing: { label: 'Processing', className: 'bg-accent/15 text-accent border-accent/30' },
  shipped: { label: 'Shipped', className: 'bg-secondary text-foreground border-border' },
  delivered: { label: 'Delivered', className: 'bg-success/15 text-success border-success/30' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/15 text-destructive border-destructive/30' },
}

export function OrderStatusBadge({ status }: { status: MockOrder['status'] }) {
  const config = CONFIG[status]
  return (
    <Badge variant="outline" className={cn(config.className)}>
      {config.label}
    </Badge>
  )
}
