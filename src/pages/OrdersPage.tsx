import { useMemo, useState } from 'react'
import { Filter, Search, X } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderCard } from '@/components/orders/OrderCard'
import { OrderDetailSheet } from '@/components/orders/OrderDetailSheet'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { useOrders } from '@/data/queries'
import { useUpdateOrderStatus } from '@/data/mutations'
import type { Order, OrderStatus } from '@/data/types'
import { cn } from '@/lib/utils'
import { pageEnter } from '@/lib/motion'

type FilterValue = 'all' | 'in_progress' | OrderStatus

const IN_PROGRESS_STATUSES: OrderStatus[] = ['processing', 'packed', 'shipped']

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Packed', value: 'packed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
]

export function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders()
  const updateStatus = useUpdateOrderStatus()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const counts = useMemo(() => {
    const list = orders ?? []
    return {
      total: list.length,
      pending: list.filter((o) => o.status === 'pending').length,
      inProgress: list.filter((o) => IN_PROGRESS_STATUSES.includes(o.status)).length,
      delivered: list.filter((o) => o.status === 'delivered').length,
    }
  }, [orders])

  const stats: { label: string; value: number; filter: FilterValue }[] = [
    { label: 'Total', value: counts.total, filter: 'all' },
    { label: 'Pending', value: counts.pending, filter: 'pending' },
    { label: 'In progress', value: counts.inProgress, filter: 'in_progress' },
    { label: 'Delivered', value: counts.delivered, filter: 'delivered' },
  ]

  const filteredOrders = useMemo(() => {
    return (orders ?? []).filter((order) => {
      const matchesQuery =
        order.customerName.toLowerCase().includes(query.toLowerCase()) ||
        order.id.toLowerCase().includes(query.toLowerCase())
      const matchesFilter =
        filter === 'all' ||
        (filter === 'in_progress' ? IN_PROGRESS_STATUSES.includes(order.status) : order.status === filter)
      return matchesQuery && matchesFilter
    })
  }, [orders, query, filter])

  function handleStatusChange(orderId: string, status: OrderStatus) {
    updateStatus.mutate({ orderId, status })
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev))
  }

  const now = Date.now()

  return (
    <div className={cn('pb-8', pageEnter)}>
      <TopBar title="Orders" subtitle={`${counts.total} orders total`} />

      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:px-8 md:py-6">
        <div className="grid grid-cols-4 gap-2 text-center sm:max-w-md">
          {stats.map((stat) => (
            <button
              key={stat.label}
              type="button"
              onClick={() => setFilter(stat.filter)}
              aria-pressed={filter === stat.filter}
              className={cn(
                'rounded-lg border px-2 py-2.5 transition-colors',
                filter === stat.filter
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/40',
              )}
            >
              <p className="font-mono text-lg font-semibold tabular-nums">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="size-3.5" aria-hidden="true" />
                Filters
                {filter !== 'all' ? (
                  <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    1
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
                {FILTER_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {filter !== 'all' || query ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => {
                setFilter('all')
                setQuery('')
              }}
            >
              <X className="size-3.5" aria-hidden="true" />
              Clear
            </Button>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
          {isLoading ? (
            <CardListSkeleton />
          ) : error ? (
            <ErrorState message={error.message} />
          ) : filteredOrders.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No orders match your search.</p>
          ) : (
            <div
              key={filter}
              className="grid grid-cols-1 gap-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-300 sm:grid-cols-2 lg:grid-cols-3"
            >
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
      </div>

      <OrderDetailSheet
        order={selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
