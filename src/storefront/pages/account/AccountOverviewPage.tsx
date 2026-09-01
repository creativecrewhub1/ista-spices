import { Link } from 'react-router-dom'
import { ArrowRight, Heart, MapPin, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatINR } from '../../components/PriceTag'
import { mockAddresses, mockCustomer, mockOrders } from '../../data/account'
import { useWishlist } from '../../wishlist/WishlistContext'
import { OrderStatusBadge } from './OrderStatusBadge'

export function AccountOverviewPage() {
  const { ids } = useWishlist()
  const recentOrders = mockOrders.slice(0, 2)
  const defaultAddress = mockAddresses.find((a) => a.isDefault)

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Package className="mb-3 size-5 text-accent" aria-hidden="true" />
          <p className="text-2xl font-medium tabular-nums text-foreground">{mockOrders.length}</p>
          <p className="text-sm text-muted-foreground">Total orders</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Heart className="mb-3 size-5 text-accent" aria-hidden="true" />
          <p className="text-2xl font-medium tabular-nums text-foreground">{ids.size}</p>
          <p className="text-sm text-muted-foreground">Saved items</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <MapPin className="mb-3 size-5 text-accent" aria-hidden="true" />
          <p className="truncate text-2xl font-medium text-foreground">{defaultAddress?.city ?? '—'}</p>
          <p className="text-sm text-muted-foreground">Default address</p>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium text-foreground">Recent orders</h2>
          <Button variant="link" asChild className="h-auto gap-1 p-0 text-sm">
            <Link to="/account/orders">
              View all <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          {recentOrders.map((order) => (
            <li key={order.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{order.id}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}{' '}
                  &middot; {order.items.length} item{order.items.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <OrderStatusBadge status={order.status} />
                <span className="text-sm font-medium tabular-nums text-foreground">{formatINR(order.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-base font-medium text-foreground">Account details</h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="text-foreground">{mockCustomer.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="text-foreground">{mockCustomer.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="text-foreground">{mockCustomer.phone}</dd>
          </div>
        </dl>
        <Button variant="link" asChild className="mt-2 h-auto p-0 text-sm">
          <Link to="/account/profile">Edit profile</Link>
        </Button>
      </div>
    </div>
  )
}
