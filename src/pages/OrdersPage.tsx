import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OrderCard } from '@/components/orders/OrderCard'
import { OrderDetailSheet } from '@/components/orders/OrderDetailSheet'
import { orders as initialOrders } from '@/data/mock-data'
import type { Order, OrderStatus } from '@/data/types'

type FilterValue = 'all' | OrderStatus

const now = new Date('2026-08-18T14:00:00').getTime()

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const counts = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === 'pending').length,
      inProgress: orders.filter((o) => o.status === 'processing' || o.status === 'packed' || o.status === 'shipped').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesQuery =
        order.customerName.toLowerCase().includes(query.toLowerCase()) ||
        order.id.toLowerCase().includes(query.toLowerCase())
      const matchesFilter = filter === 'all' || order.status === filter
      return matchesQuery && matchesFilter
    })
  }, [orders, query, filter])

  function handleStatusChange(orderId: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev))
  }

  return (
    <div className="pb-8">
      <TopBar title="Orders" subtitle={`${counts.total} orders today`} />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <div className="grid grid-cols-4 gap-2 text-center sm:max-w-md">
          {[
            { label: 'Total', value: counts.total },
            { label: 'Pending', value: counts.pending },
            { label: 'In progress', value: counts.inProgress },
            { label: 'Delivered', value: counts.delivered },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card px-2 py-2.5">
              <p className="font-mono text-lg font-semibold tabular-nums">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="relative sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by customer or order ID..."
            className="pl-9"
            aria-label="Search orders"
          />
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-max">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="packed">Packed</TabsTrigger>
              <TabsTrigger value="shipped">Shipped</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {filteredOrders.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No orders match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpen={setSelectedOrder}
                isLate={
                  order.status !== 'delivered' &&
                  order.status !== 'cancelled' &&
                  new Date(order.eta).getTime() < now
                }
              />
            ))}
          </div>
        )}
      </div>

      <OrderDetailSheet
        order={selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
