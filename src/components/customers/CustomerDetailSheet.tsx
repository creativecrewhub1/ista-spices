import { Phone } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import type { Customer, Order } from '@/data/types'
import { orderStatusConfig, segmentConfig } from '@/lib/status'
import { formatCurrency, formatDate, formatDateLong } from '@/lib/format'

interface CustomerDetailSheetProps {
  customer: Customer | null
  orders: Order[]
  onOpenChange: (open: boolean) => void
}

export function CustomerDetailSheet({ customer, orders, onOpenChange }: CustomerDetailSheetProps) {
  if (!customer) return null

  const segment = segmentConfig[customer.segment]
  const customerOrders = orders
    .filter((order) => order.customerId === customer.id)
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())

  return (
    <Sheet open={Boolean(customer)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{customer.name}</SheetTitle>
          <SheetDescription>Customer since {formatDateLong(customer.joinedAt)}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary/15 text-base font-semibold text-primary">
                {customer.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className={segment.badgeClass}>
                  {segment.label}
                </Badge>
                {customer.planStatus !== 'none' ? (
                  <Badge
                    variant="outline"
                    className={
                      customer.planStatus === 'active'
                        ? 'border-success/30 bg-success/15 text-success'
                        : 'border-warning/30 bg-warning/15 text-warning'
                    }
                  >
                    Plan {customer.planStatus}
                  </Badge>
                ) : null}
              </div>
            </div>
            <Button size="icon" variant="outline" aria-label={`Call ${customer.name}`}>
              <Phone className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lifetime value</p>
              <p className="font-mono font-medium tabular-nums">{formatCurrency(customer.totalSpend)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Delivery address</p>
              <p className="font-medium">{customer.address}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Order history ({customerOrders.length})
            </p>
            <ul className="flex flex-col gap-3">
              {customerOrders.map((order) => {
                const status = orderStatusConfig[order.status]
                return (
                  <li key={order.id} className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
                      <p className="truncate">{order.items.map((i) => i.name).join(', ')}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDate(order.placedAt)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant="outline" className={status.badgeClass}>
                        {status.label}
                      </Badge>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
