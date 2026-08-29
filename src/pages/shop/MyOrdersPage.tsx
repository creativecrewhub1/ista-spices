import { Link } from 'react-router-dom'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/shop/GoogleIcon'
import { useAuth } from '@/auth/AuthProvider'
import { useMyOrders } from '@/data/queries'
import { orderStatusConfig } from '@/lib/status'
import { formatCurrency, formatDateLong } from '@/lib/format'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function MyOrdersPage() {
  const { session, loading: authLoading, signInWithGoogle } = useAuth()
  const { data: orders, isLoading, error } = useMyOrders()

  return (
    <div className={cn('pb-8', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-8">
        <h1 className="mb-6 font-heading text-xl font-semibold">My orders</h1>

        {authLoading ? null : !session ? (
          <Card>
            <CardHeader>
              <CardTitle>Sign in to see your orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2" onClick={() => signInWithGoogle()}>
                <GoogleIcon />
                Continue with Google
              </Button>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <CardListSkeleton count={3} />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : !orders?.length ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">You haven't placed any orders yet.</p>
            <Button asChild>
              <Link to="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-sm">
                    {order.id} · {formatDateLong(order.placedAt)}
                  </CardTitle>
                  <Badge variant="outline" className={orderStatusConfig[order.status].badgeClass}>
                    {orderStatusConfig[order.status].label}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-1">
                  {order.items.map((item) => (
                    <div key={`${item.productId}-${item.packSize}`} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.name} ({item.packSize}) × {item.qty}
                      </span>
                      <span className="font-mono tabular-nums">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between border-t border-border pt-2 text-sm font-semibold">
                    <span>Total</span>
                    <span className="font-mono tabular-nums">{formatCurrency(order.total)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
