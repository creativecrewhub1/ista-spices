import { Check } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Order, OrderStatus } from '@/data/types'
import { orderStatusConfig } from '@/lib/status'
import { formatCurrency, formatDateLong, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'

const trackingSteps: OrderStatus[] = ['pending', 'processing', 'packed', 'shipped', 'delivered']

interface OrderDetailSheetProps {
  order: Order | null
  onOpenChange: (open: boolean) => void
  onStatusChange: (orderId: string, status: OrderStatus) => void
}

export function OrderDetailSheet({ order, onOpenChange, onStatusChange }: OrderDetailSheetProps) {
  if (!order) return null

  const currentStepIndex = trackingSteps.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <Sheet open={Boolean(order)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono">{order.id}</SheetTitle>
          <SheetDescription>{order.customerName}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-4">
          {!isCancelled ? (
            <ol className="flex items-center justify-between">
              {trackingSteps.map((step, index) => {
                const config = orderStatusConfig[step]
                const isDone = index <= currentStepIndex
                return (
                  <li key={step} className="flex flex-1 flex-col items-center gap-1 text-center">
                    <div className="flex w-full items-center">
                      <div
                        className={cn(
                          'h-0.5 flex-1',
                          index === 0 ? 'opacity-0' : isDone ? 'bg-primary' : 'bg-border',
                        )}
                      />
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-semibold',
                          isDone ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground',
                        )}
                      >
                        {isDone ? <Check className="size-3" aria-hidden="true" /> : index + 1}
                      </span>
                      <div
                        className={cn(
                          'h-0.5 flex-1',
                          index === trackingSteps.length - 1
                            ? 'opacity-0'
                            : index < currentStepIndex
                              ? 'bg-primary'
                              : 'bg-border',
                        )}
                      />
                    </div>
                    <span className="text-[10px] leading-tight text-muted-foreground">
                      {config.label}
                    </span>
                  </li>
                )
              })}
            </ol>
          ) : (
            <Badge variant="outline" className={orderStatusConfig.cancelled.badgeClass}>
              Cancelled
            </Badge>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground" htmlFor="order-status">
              Update status
            </label>
            <Select value={order.status} onValueChange={(v: OrderStatus) => onStatusChange(order.id, v)}>
              <SelectTrigger id="order-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(orderStatusConfig).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Packed on</p>
              <p className="font-medium">{formatDateLong(order.packedDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ETA</p>
              <p className="font-medium">{formatTime(order.eta)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Order type</p>
              <p className="font-medium capitalize">
                {order.kind === 'subscription' ? 'Subscription refill' : 'One-time order'}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Items</p>
            <ul className="flex flex-col gap-2">
              {order.items.map((line) => (
                <li key={`${line.productId}-${line.packSize}`} className="flex items-center justify-between text-sm">
                  <span>
                    {line.qty}× {line.name} <span className="text-muted-foreground">({line.packSize})</span>
                  </span>
                  <span className="font-mono tabular-nums">{formatCurrency(line.price * line.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
              <span>Total</span>
              <span className="font-mono tabular-nums">{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Delivery address</p>
            <p className="text-sm font-medium">{order.address}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
