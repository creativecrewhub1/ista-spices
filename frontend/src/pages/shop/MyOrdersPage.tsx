import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useMyOrders } from '@/data/queries'
import { orderStatusConfig } from '@/lib/status'
import { formatCurrency, formatDateLong } from '@/lib/format'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { formatPack } from '@/lib/packLabel'
import { useUnits } from '@/data/queries'

// Reaching this page at all requires a session — see RequireSession in App.tsx.
export function MyOrdersPage() {
  const { data: units = [] } = useUnits()
  const { data: orders, isLoading, error } = useMyOrders()

  return (
    <div className={cn('storefront min-h-svh bg-background pb-8 font-sans text-foreground', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <h1 className="mb-6 font-display text-3xl font-bold text-foreground sm:text-4xl">My orders</h1>

        {isLoading ? (
          <CardListSkeleton count={3} />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : !orders?.length ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Package className="size-6" aria-hidden="true" />
            </span>
            <p className="font-display text-xl text-foreground">No orders yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <Button asChild className="mt-2">
              <Link to="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{formatDateLong(order.placedAt)}</p>
                    <p className="text-xs text-muted-foreground">{order.address}</p>
                  </div>
                  <Badge variant="outline" className={orderStatusConfig[order.status].badgeClass}>
                    {orderStatusConfig[order.status].label}
                  </Badge>
                </div>
                <Separator />
                <div className="flex flex-col gap-1.5">
                  {order.items.map((item) => (
                    <div key={`${item.productId}-${item.packQty}`} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} ({formatPack(item.packQty, item.packUnit, units)}) &times; {item.qty}
                      </span>
                      <span className="tabular-nums text-foreground">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-sm font-medium">
                  <span className="text-foreground">Total</span>
                  <span className="tabular-nums text-foreground">{formatCurrency(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
