import { useState } from 'react'
import {
  Search,
  Phone,
  ShoppingBag,
  ChevronRight,
  UserCheck,
  MapPin,
  Mail,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { OrderDetailSheet } from '@/components/orders/OrderDetailSheet'
import { CardListSkeleton, ErrorState } from '@/components/common/QueryState'
import { useCustomerCounts, useCustomerOrders, useCustomers } from '@/data/queries'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useUpdateOrderStatus } from '@/data/mutations'
import type { Customer, Order, OrderStatus } from '@/data/types'
import { orderStatusConfig, segmentConfig } from '@/lib/status'
import { formatCurrency, formatDateLong } from '@/lib/format'
import { cn } from '@/lib/utils'
import { pageEnter } from '@/lib/motion'

type FilterValue = 'all' | 'new' | 'regular'

const FILTER_TABS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Regular', value: 'regular' },
]

// Extract city/locality from full address for location display
function getCityFromAddress(address: string | null): string {
  if (!address) return 'Not on file'
  const parts = address.split(',')
  if (parts.length >= 2) return `${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`
  return address
}

export function CustomersPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null)

  // Don't fire a request on every keystroke.
  const debouncedQuery = useDebouncedValue(query, 300)

  const {
    data: customers,
    isLoading,
    error,
  } = useCustomers({
    search: debouncedQuery || undefined,
    segment: filter === 'all' ? undefined : filter,
  })
  const { data: customerCounts } = useCustomerCounts()
  const updateStatus = useUpdateOrderStatus()

  // Whole-book tallies, independent of the filter the list is under.
  const counts = customerCounts ?? { total: 0, new: 0, regular: 0 }

  // Search and filter are applied server-side.
  const filteredCustomers = customers ?? []

  // Resolved by foreign key on the server, not by matching customer names.
  const { data: selectedCustomerOrders = [] } = useCustomerOrders(selectedCustomer?.id ?? null)

  function handleStatusChange(orderId: string, status: OrderStatus) {
    updateStatus.mutate({ orderId, status })
    setSelectedOrderForDetail((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev))
  }

  return (
    <div className={cn('pb-16 min-h-screen bg-[#F7F3ED]', pageEnter)}>
      <TopBar title="Customer Management" subtitle={`${counts.total} total customers registered`} />

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-3 py-4 md:px-8 md:py-6">
        
        {/* TOP FILTER TABS & SEARCH BAR */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          
          {/* Left: Filter Pills (All, Active, Inactive, New, Regular) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {FILTER_TABS.map((tab) => {
              const isActive = filter === tab.value
              const countVal =
                tab.value === 'all' ? counts.total : tab.value === 'new' ? counts.new : counts.regular

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter(tab.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all duration-300 ease-out cursor-pointer shadow-2xs shrink-0 active:scale-95',
                    isActive
                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20'
                      : 'bg-white text-slate-700 hover:bg-orange-50 hover:text-orange-600 border border-slate-200/80',
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-black',
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800',
                    )}
                  >
                    {countVal}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Right: Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or phone..."
              className="rounded-2xl border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
              aria-label="Search customers"
            />
          </div>
        </div>

        {/* LOADING & ERROR STATES */}
        {isLoading ? (
          <div className="p-6 bg-white rounded-3xl border border-orange-100">
            <CardListSkeleton />
          </div>
        ) : error ? (
          <div className="p-6 bg-white rounded-3xl border border-orange-100">
            <ErrorState message={error.message} />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border border-orange-100 text-center text-slate-500 space-y-2">
            <UserCheck className="size-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold">No customers match your search query.</p>
          </div>
        ) : (
          <div
            key={`${filter}-${query}-${selectedCustomer ? 'split' : 'table'}`}
            className="motion-safe:animate-in motion-safe:fade-in-50 motion-safe:slide-in-from-bottom-2 duration-300 ease-out"
          >
            {/* VIEW 1: MASTER DIRECTORY TABLE (When no customer is selected) */}
            {!selectedCustomer ? (
              <>
                {/* Mobile Cards (< md) */}
                <div className="flex flex-col gap-3 md:hidden">
                  {filteredCustomers.map((customer) => {
                    return (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className="group rounded-3xl border border-orange-100/90 bg-white p-4 shadow-2xs transition-all duration-300 active:scale-[0.99] cursor-pointer space-y-3 hover:border-orange-200 hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 ring-2 ring-orange-200/80 shrink-0">
                              <AvatarFallback className="bg-gradient-to-tr from-orange-400 to-rose-400 text-white font-bold text-xs">
                                {customer.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors duration-300 block">
                                {customer.name}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                                <Phone className="size-3 text-slate-400" /> {customer.phone ?? 'Not on file'}
                              </span>
                            </div>
                          </div>

                        </div>

                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-semibold">
                          <span className="flex items-center gap-1 text-slate-500 font-medium">
                            <MapPin className="size-3 text-orange-500" /> {getCityFromAddress(customer.address)}
                          </span>
                          <span className="flex items-center gap-1">
                            <ShoppingBag className="size-3.5 text-orange-500" /> {customer.totalOrders || 1} orders
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-xs text-slate-500 font-medium">Lifetime Spend:</span>
                          <div className="flex items-center gap-1 text-right">
                            <span className="font-mono text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                              {formatCurrency(customer.totalSpend)}
                            </span>
                            <ChevronRight className="size-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop Master Table (>= md) */}
                <div className="hidden md:block overflow-hidden rounded-3xl border border-orange-100/90 bg-white shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-orange-100/80 bg-[#FDF8F3] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-4 px-6">Customer</th>
                          <th className="py-4 px-6 w-44">Phone</th>
                          <th className="py-4 px-6">Location</th>
                          <th className="py-4 px-6 w-36">Total Orders</th>
                          <th className="py-4 px-6 w-44 text-right">Total Spent</th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100/80">
                        {filteredCustomers.map((customer) => {
                                return (
                            <tr
                              key={customer.id}
                              onClick={() => setSelectedCustomer(customer)}
                              className="group cursor-pointer transition-all duration-300 ease-out bg-white hover:bg-gradient-to-r hover:from-orange-50/90 hover:via-amber-50/40 hover:to-orange-50/20"
                            >
                              {/* 1. CUSTOMER AVATAR & NAME */}
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <Avatar className="size-8.5 ring-2 ring-orange-200/60 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                                    <AvatarFallback className="bg-gradient-to-tr from-orange-400 to-rose-400 text-white font-bold text-xs">
                                      {customer.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors duration-300 text-xs sm:text-sm block">
                                      {customer.name}
                                    </span>
                                    <Badge variant="outline" className="bg-orange-50/80 text-orange-700 border-orange-200/80 text-[10px] font-bold px-2 py-0">
                                      {segmentConfig[customer.segment].label}
                                    </Badge>
                                  </div>
                                </div>
                              </td>

                              {/* 2. PHONE */}
                              <td className="py-4 px-6 font-mono font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">
                                <div className="flex items-center gap-1.5">
                                  <Phone className="size-3 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
                                  <span>{customer.phone ?? 'Not on file'}</span>
                                </div>
                              </td>

                              {/* 3. LOCATION */}
                              <td className="py-4 px-6 font-medium text-slate-700">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="size-3.5 text-orange-500 shrink-0" />
                                  <span className="truncate max-w-[200px]">{getCityFromAddress(customer.address)}</span>
                                </div>
                              </td>

                              {/* 4. TOTAL ORDERS */}
                              <td className="py-4 px-6 font-semibold text-slate-800">
                                <div className="flex items-center gap-1.5">
                                  <ShoppingBag className="size-3.5 text-orange-500 shrink-0" />
                                  <span>{customer.totalOrders || 1} orders</span>
                                </div>
                              </td>

                              {/* 5. TOTAL SPENT */}
                              <td className="py-4 px-6 text-right font-mono text-sm font-black text-slate-900 group-hover:text-orange-600 group-hover:scale-105 transition-all duration-300">
                                {formatCurrency(customer.totalSpend)}
                              </td>

                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* VIEW 2: SHIPORA SPLIT CRM VIEW (Triggered on customer row click) */
              <div className="flex flex-col lg:flex-row gap-5">
                
                {/* LEFT COLUMN (1/3 Width / 320px Sidebar): Scrollable Customer List */}
                <div className="w-full lg:w-80 shrink-0 flex flex-col gap-3 rounded-3xl border border-orange-100/90 bg-white p-4 shadow-xs max-h-[750px] overflow-y-auto">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Customers List ({filteredCustomers.length})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-xs text-orange-600 font-bold hover:text-orange-700 h-7 px-2 bg-orange-50/80 hover:bg-orange-100 rounded-xl"
                    >
                      <ArrowLeft className="size-3.5 mr-1" /> Directory Table
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {filteredCustomers.map((c) => {
                      const isSelected = selectedCustomer?.id === c.id

                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCustomer(c)}
                          className={cn(
                            'group flex items-center gap-3 rounded-2xl p-3 cursor-pointer transition-all duration-300 border',
                            isSelected
                              ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20 scale-[1.01]'
                              : 'border-slate-100 bg-slate-50/50 hover:bg-orange-50/60 hover:border-orange-200 text-slate-900',
                          )}
                        >
                          <div className="relative shrink-0">
                            <Avatar className="size-10 ring-2 ring-white/80">
                              <AvatarFallback
                                className={cn(
                                  'font-bold text-xs',
                                  isSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700',
                                )}
                              >
                                {c.initials}
                              </AvatarFallback>
                            </Avatar>
                          </div>

                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <p className={cn('text-xs font-bold truncate', isSelected ? 'text-white' : 'text-slate-900')}>
                                {c.name}
                              </p>
                              {isSelected && <ChevronRight className="size-3.5 text-white shrink-0" />}
                            </div>
                            <p className={cn('text-[11px] font-mono truncate', isSelected ? 'text-white/80' : 'text-slate-500')}>
                              {c.phone ?? 'Not on file'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* RIGHT COLUMN (2/3 Width / Flex-1): Active Customer Profile & Order Overview */}
                <div className="flex-1 flex flex-col gap-5">
                  
                  {/* TOP PROFILE OVERVIEW CARD (Matching Image 2 Red Box 2) */}
                  <div className="rounded-3xl border border-orange-100/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Profile Avatar & Primary Info */}
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <Avatar className="size-16 ring-4 ring-orange-100 shadow-sm">
                            <AvatarFallback className="bg-gradient-to-tr from-orange-500 to-rose-500 text-white font-black text-lg">
                              {selectedCustomer.initials}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight">
                              {selectedCustomer.name}
                            </h2>
                          </div>

                          {/* Contact Sub-details */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-semibold pt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <Phone className="size-3 text-orange-500" /> {selectedCustomer.phone ?? 'Not on file'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="size-3 text-orange-500" /> {getCityFromAddress(selectedCustomer.address)}
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <Mail className="size-3 text-orange-500" /> {(selectedCustomer.email ?? 'Not on file')}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Top Metric Cards: Total Orders & Total Spent */}
                      <div className="flex items-center gap-3">
                        
                        {/* Metric Box 1: Total Orders */}
                        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/70 to-amber-50/40 p-4 min-w-[130px] text-left">
                          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <ShoppingBag className="size-3.5 text-orange-500" /> Total Orders
                          </span>
                          <span className="block font-mono text-2xl font-black text-slate-900 mt-1">
                            {selectedCustomerOrders.length || selectedCustomer.totalOrders || 1}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                            <TrendingUp className="size-3" /> ↑ 12.4% vs last month
                          </span>
                        </div>

                        {/* Metric Box 2: Total Spent */}
                        <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/70 to-amber-50/40 p-4 min-w-[140px] text-left">
                          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            <ShoppingBag className="size-3.5 text-rose-500" /> Total Spent
                          </span>
                          <span className="block font-mono text-2xl font-black text-slate-900 mt-1">
                            {formatCurrency(selectedCustomer.totalSpend)}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-1">
                            <TrendingUp className="size-3" /> ↑ 10.4% vs last month
                          </span>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* BOTTOM ORDER OVERVIEW SECTION (Matching Image 2 Red Box 3) */}
                  <div className="rounded-3xl border border-orange-100/90 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="font-display text-lg font-black text-slate-900">
                        Order overview ({selectedCustomerOrders.length})
                      </h3>
                    </div>

                    {selectedCustomerOrders.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 space-y-2">
                        <ShoppingBag className="size-10 mx-auto text-slate-300" />
                        <p className="text-sm font-semibold">No orders recorded for this customer.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 font-bold uppercase tracking-wider text-slate-500">
                              <th className="py-3 px-4 w-36">Order ID</th>
                              <th className="py-3 px-4">Items Summary</th>
                              <th className="py-3 px-4 w-36">Delivery Date</th>
                              <th className="py-3 px-4 w-32">Status</th>
                              <th className="py-3 px-4 text-right w-32">Amount</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-100">
                            {selectedCustomerOrders.map((order) => {
                              const status = orderStatusConfig[order.status]
                              return (
                                <tr
                                  key={order.id}
                                  onClick={() => setSelectedOrderForDetail(order)}
                                  className="group cursor-pointer transition-all duration-200 hover:bg-orange-50/60"
                                >
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                    #{order.id}
                                  </td>

                                  <td className="py-3.5 px-4 font-semibold text-slate-700 max-w-[200px] truncate">
                                    {order.items.map((i) => i.name).join(', ')}
                                  </td>

                                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                                    {formatDateLong(order.placedAt)}
                                  </td>

                                  <td className="py-3.5 px-4">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        'px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-2xs',
                                        status.badgeClass,
                                      )}
                                    >
                                      {status.label}
                                    </Badge>
                                  </td>

                                  <td className="py-3.5 px-4 text-right font-mono text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                                    {formatCurrency(order.total)}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDE ORDER DETAIL DRAWER (Triggers on clicking any order row in Order Overview) */}
      <OrderDetailSheet
        order={selectedOrderForDetail}
        onOpenChange={(open) => !open && setSelectedOrderForDetail(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
