import { useMemo, useState } from 'react'
import { Filter, Search, X, ShoppingBag, Calendar, ChevronRight, Clock, PackageCheck, CheckCircle2 } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { OrderDetailSheet } from '@/components/orders/OrderDetailSheet'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { useOrders, useOrderStatusCounts } from '@/data/queries'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { productImage } from '@/lib/productImage'
import { useUpdateOrderStatus } from '@/data/mutations'
import type { Order, OrderStatus } from '@/data/types'
import { orderStatusConfig } from '@/lib/status'
import { formatCurrency, formatDateLong } from '@/lib/format'
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

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function OrdersPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  // Don't fire a request on every keystroke.
  const debouncedQuery = useDebouncedValue(query, 300)

  // 'in_progress' spans three statuses, so it stays a client-side narrowing of
  // an unfiltered fetch; every other filter is applied server-side.
  const serverStatus = filter === 'all' || filter === 'in_progress' ? undefined : filter
  const {
    data: orders,
    isLoading,
    error,
  } = useOrders({ status: serverStatus, search: debouncedQuery || undefined })
  const { data: statusCounts } = useOrderStatusCounts()
  const updateStatus = useUpdateOrderStatus()

  const counts = useMemo(() => {
    const c = statusCounts
    if (!c) return { total: 0, pending: 0, inProgress: 0, delivered: 0 }
    return {
      total: c.pending + c.processing + c.packed + c.shipped + c.delivered + c.cancelled,
      pending: c.pending,
      inProgress: c.processing + c.packed + c.shipped,
      delivered: c.delivered,
    }
  }, [statusCounts])

  const stats = [
    { label: 'All Orders', value: counts.total, filter: 'all' as FilterValue, icon: ShoppingBag, color: 'text-orange-500 bg-orange-100/70' },
    { label: 'Pending', value: counts.pending, filter: 'pending' as FilterValue, icon: Clock, color: 'text-amber-600 bg-amber-100/70' },
    { label: 'In Progress', value: counts.inProgress, filter: 'in_progress' as FilterValue, icon: PackageCheck, color: 'text-blue-600 bg-blue-100/70' },
    { label: 'Delivered', value: counts.delivered, filter: 'delivered' as FilterValue, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100/70' },
  ]

  // Status and search already applied server-side; only the 'in_progress'
  // bucket (three statuses at once) is narrowed here.
  const filteredOrders = useMemo(() => {
    const list = orders ?? []
    if (filter !== 'in_progress') return list
    return list.filter((order) => IN_PROGRESS_STATUSES.includes(order.status))
  }, [orders, filter])

  function handleStatusChange(orderId: string, status: OrderStatus) {
    updateStatus.mutate({ orderId, status })
    setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev))
  }

  return (
    <div className={cn('pb-16 min-h-screen bg-[#F7F3ED]', pageEnter)}>
      <TopBar title="Orders Management" subtitle={`${counts.total} total orders placed`} />

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-3 py-4 md:px-8 md:py-6">
        
        {/* RESPONSIVE 2X2 MOBILE / 4-COL DESKTOP ORDERS KPI METRIC CARDS */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {stats.map((stat) => {
            const isActive = filter === stat.filter
            const Icon = stat.icon
            return (
              <button
                key={stat.label}
                type="button"
                onClick={() => setFilter(stat.filter)}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-2xl p-3.5 sm:p-4 text-left transition-all cursor-pointer border shadow-2xs group',
                  isActive
                    ? 'border-orange-500 bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/25 ring-2 ring-orange-500/30 scale-[1.02]'
                    : 'border-orange-100/80 bg-white text-slate-900 hover:bg-orange-50/60 hover:border-orange-200',
                )}
              >
                <div className="space-y-0.5 min-w-0">
                  <span
                    className={cn(
                      'block text-[11px] font-bold uppercase tracking-wider truncate',
                      isActive ? 'text-white/80' : 'text-slate-500',
                    )}
                  >
                    {stat.label}
                  </span>
                  <span
                    className={cn(
                      'block font-mono text-xl sm:text-2xl font-black tabular-nums tracking-tight',
                      isActive ? 'text-white' : 'text-slate-900',
                    )}
                  >
                    {stat.value}
                  </span>
                </div>

                <span
                  className={cn(
                    'flex size-9 sm:size-10 items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-110',
                    isActive ? 'bg-white/20 text-white' : stat.color,
                  )}
                >
                  <Icon className="size-4.5 sm:size-5" />
                </span>
              </button>
            )
          })}
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search ID or customer..."
              className="rounded-2xl border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              aria-label="Search orders"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl border-slate-200 bg-white text-slate-700 hover:bg-orange-50 font-bold text-xs gap-1.5 h-9 shrink-0"
              >
                <Filter className="size-3.5 text-orange-500" aria-hidden="true" />
                <span className="hidden sm:inline">Filter</span>
                {filter !== 'all' ? (
                  <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    1
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-slate-200 p-2 shadow-xl bg-white">
              <DropdownMenuLabel className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Filter by Status
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              <DropdownMenuRadioGroup value={filter} onValueChange={(v) => setFilter(v as FilterValue)}>
                {FILTER_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option.value} value={option.value} className="rounded-xl font-semibold cursor-pointer">
                    {option.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {(filter !== 'all' || query) && (
            <Button
              variant="ghost"
              size="sm"
              className="rounded-2xl text-slate-500 hover:text-rose-600 font-semibold text-xs gap-1 shrink-0"
              onClick={() => {
                setFilter('all')
                setQuery('')
              }}
            >
              <X className="size-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>

        {/* CONTENT AREA: MOBILE CARD LIST (< md) VS DESKTOP TABLE (>= md) */}
        {isLoading ? (
          <div className="p-6 bg-white rounded-3xl border border-orange-100">
            <CardListSkeleton />
          </div>
        ) : error ? (
          <div className="p-6 bg-white rounded-3xl border border-orange-100">
            <ErrorState message={error.message} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border border-orange-100 text-center text-slate-500 space-y-2">
            <ShoppingBag className="size-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">No orders match your search criteria.</p>
          </div>
        ) : (
          <>
            {/* 1. MOBILE VIEW (< md): Touch-friendly card list */}
            <div className="flex flex-col gap-3 md:hidden">
              {filteredOrders.map((order) => {
                const config = orderStatusConfig[order.status]
                const isSelected = selectedOrder?.id === order.id

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={cn(
                      'group rounded-3xl border bg-white p-4 shadow-2xs transition-all active:scale-[0.99] cursor-pointer space-y-3',
                      isSelected ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-500/20' : 'border-orange-100/90',
                    )}
                  >
                    {/* Top Row: Order ID & Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          #{order.id}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">
                          • {order.kind === 'subscription' ? 'Refill' : 'Standard'}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border',
                          config.badgeClass,
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full', config.dotClass)} />
                        <span>{config.label}</span>
                      </Badge>
                    </div>

                    {/* Middle Row: Customer Info & Date */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="size-7 ring-1 ring-orange-200/80 shrink-0">
                          <AvatarFallback className="bg-gradient-to-tr from-orange-400 to-rose-400 text-white font-bold text-[10px]">
                            {getInitials(order.customerName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {order.customerName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium shrink-0">
                        <Calendar className="size-3 text-orange-400" />
                        <span>{formatDateLong(order.placedAt)}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Product Mini Thumbnails & Total Price */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100/80">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex -space-x-2 shrink-0">
                          {order.items.slice(0, 3).map((item, i) => (
                            <img
                              key={i}
                              src={productImage(item.imageUrl)}
                              alt={item.name}
                              className="size-6.5 rounded-md border-2 border-white object-cover shadow-2xs"
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 truncate">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-right">
                        <span className="font-mono text-sm font-black text-slate-900">
                          {formatCurrency(order.total)}
                        </span>
                        <ChevronRight className="size-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 2. DESKTOP VIEW (>= md): Full 6-column Table */}
            <div className="hidden md:block overflow-hidden rounded-3xl border border-orange-100/90 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-orange-100/80 bg-[#FDF8F3] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-4 px-5 w-32">Order ID</th>
                      <th className="py-4 px-5 w-36">Placed Date</th>
                      <th className="py-4 px-5 w-52">Customer</th>
                      <th className="py-4 px-5">Products Ordered</th>
                      <th className="py-4 px-5 w-36">Status</th>
                      <th className="py-4 px-5 text-right w-32">Total</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredOrders.map((order) => {
                      const isSelected = selectedOrder?.id === order.id
                      const config = orderStatusConfig[order.status]

                      return (
                        <tr
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={cn(
                            'group cursor-pointer transition-all duration-200 hover:bg-orange-50/60',
                            isSelected ? 'bg-orange-50/90 font-semibold border-l-4 border-orange-500' : 'bg-white',
                          )}
                        >
                          <td className="py-4 px-5 font-mono font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                            #{order.id}
                          </td>

                          <td className="py-4 px-5 text-slate-600 font-medium">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Calendar className="size-3 text-orange-400 shrink-0" />
                              <span className="truncate">{formatDateLong(order.placedAt)}</span>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-7.5 ring-2 ring-orange-200/60 shrink-0">
                                <AvatarFallback className="bg-gradient-to-tr from-orange-400 to-rose-400 text-white font-bold text-[10px]">
                                  {getInitials(order.customerName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-xs truncate">
                                {order.customerName}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2 shrink-0">
                                {order.items.slice(0, 3).map((item, i) => (
                                  <img
                                    key={i}
                                    src={productImage(item.imageUrl)}
                                    alt={item.name}
                                    className="size-7 rounded-lg border-2 border-white object-cover shadow-2xs"
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-semibold text-slate-700 truncate">
                                {order.items.map((i) => i.name).join(', ')}
                              </span>
                              {order.items.length > 2 && (
                                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                  +{order.items.length - 2} more
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-5">
                            <Badge
                              variant="outline"
                              className={cn(
                                'inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-full border shadow-2xs',
                                config.badgeClass,
                              )}
                            >
                              <span className={cn('size-1.5 rounded-full', config.dotClass)} />
                              <span>{config.label}</span>
                            </Badge>
                          </td>

                          <td className="py-4 px-5 text-right font-mono text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                            {formatCurrency(order.total)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* RIGHT SIDE ORDER DETAIL SHEET */}
      <OrderDetailSheet
        order={selectedOrder}
        onOpenChange={(open) => !open && setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
