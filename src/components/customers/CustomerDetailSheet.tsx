import { useState } from 'react'
import { Phone, Copy, Mail, MapPin, ShoppingBag, User, ChevronRight, Calendar } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrderDetailSheet } from '@/components/orders/OrderDetailSheet'
import type { Customer, Order, OrderStatus } from '@/data/types'
import { orderStatusConfig, segmentConfig } from '@/lib/status'
import { formatCurrency, formatDate, formatDateLong } from '@/lib/format'
import { useUpdateOrderStatus } from '@/data/mutations'
import { productImage } from '@/lib/productImage'
import { cn } from '@/lib/utils'

interface CustomerDetailSheetProps {
  customer: Customer | null
  orders: Order[]
  onOpenChange: (open: boolean) => void
}

export function CustomerDetailSheet({ customer, orders, onOpenChange }: CustomerDetailSheetProps) {
  const [copied, setCopied] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null)
  const updateStatus = useUpdateOrderStatus()

  if (!customer) return null

  const customerEmail = customer.email

  // Matched on the foreign key alone — matching on name too would pull in a
  // different customer's orders whenever two people share a name.
  const customerOrders = orders
    .filter((order) => order.customerId === customer.id)
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())

  const totalOrdersCount = customer.totalOrders || customerOrders.length || 1
  const avgOrderValue = Math.round(customer.totalSpend / Math.max(1, totalOrdersCount))

  const handleCopyPhone = () => {
    if (!customer.phone) return
    navigator.clipboard.writeText(customer.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleStatusChange(orderId: string, status: OrderStatus) {
    updateStatus.mutate({ orderId, status })
    setSelectedOrderForDetail((prev) => (prev && prev.id === orderId ? { ...prev, status } : prev))
  }

  return (
    <>
      <Sheet open={Boolean(customer)} onOpenChange={onOpenChange}>
        <SheetContent className="overflow-y-auto w-full sm:max-w-md p-6 bg-white border-l border-slate-200/80 shadow-2xl transition-all duration-300 ease-out">
          
          {/* Animated Inner Container */}
          <div className="motion-safe:animate-in motion-safe:fade-in-50 motion-safe:zoom-in-95 duration-300 ease-out">
            
            {/* Sheet Header: Customer Avatar & Actions */}
            <SheetHeader className="pb-4 border-b border-slate-100 p-0">
              <div className="flex items-center gap-3.5">
                <Avatar className="size-14 ring-2 ring-orange-300/80 shadow-xs shrink-0">
                  <AvatarFallback className="bg-gradient-to-tr from-orange-500 to-rose-500 text-white font-black text-base">
                    {customer.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1 space-y-1">
                  <SheetTitle className="font-display text-2xl font-black tracking-tight text-slate-900 truncate">
                    {customer.name}
                  </SheetTitle>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] font-bold">
                      {segmentConfig[customer.segment].label}
                    </Badge>
                    <span>• Customer since {formatDate(customer.joinedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions (Call, Copy Phone) */}
              <div className="flex items-center gap-2 pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!customer.phone}
                  onClick={() => customer.phone && window.open(`tel:${customer.phone}`)}
                  className="rounded-xl border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 text-slate-700 text-xs font-bold gap-1.5 py-1 px-3 h-8 active:scale-95 transition-all disabled:opacity-40"
                >
                  <Phone className="size-3.5 text-orange-500" />
                  <span>Call Customer</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={!customer.phone}
                  onClick={handleCopyPhone}
                  className="rounded-xl border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 text-slate-700 text-xs font-semibold gap-1.5 py-1 px-3 h-8 active:scale-95 transition-all disabled:opacity-40"
                >
                  <Copy className="size-3.5 text-slate-500" />
                  <span>{copied ? 'Copied!' : 'Copy Phone'}</span>
                </Button>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-5 py-5">
              
              {/* LIFETIME METRIC CARDS */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/60 to-amber-50/30 p-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total Spend
                  </span>
                  <span className="block font-mono text-sm font-black text-slate-900 mt-0.5">
                    {formatCurrency(customer.totalSpend)}
                  </span>
                </div>

                {/* CLICKABLE TOTAL ORDERS METRIC CARD */}
                <button
                  type="button"
                  onClick={() => setHistoryModalOpen(true)}
                  className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-500 to-rose-500 p-3 text-center text-white shadow-md shadow-orange-500/20 hover:scale-105 transition-all duration-300 cursor-pointer group"
                >
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-white/80 group-hover:text-white">
                    Total Orders
                  </span>
                  <span className="block font-mono text-sm font-black text-white mt-0.5 flex items-center justify-center gap-1">
                    {totalOrdersCount} <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </button>

                <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/60 to-amber-50/30 p-3 text-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Avg Order
                  </span>
                  <span className="block font-mono text-sm font-black text-slate-900 mt-0.5">
                    {formatCurrency(avgOrderValue)}
                  </span>
                </div>
              </div>

              {/* CONTACT & ADDRESS DETAILS */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="size-3.5 text-orange-500" /> Customer Information
                </h3>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Phone className="size-3 text-slate-400" /> Phone:
                    </span>
                    <span
                      className={cn('font-mono', customer.phone ? 'font-bold text-slate-900' : 'text-slate-400')}
                    >
                      {customer.phone ?? 'Not on file'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Mail className="size-3 text-slate-400" /> Email:
                    </span>
                    <span
                      className={cn(
                        'font-mono',
                        customerEmail ? 'font-semibold text-slate-800' : 'text-slate-400',
                      )}
                    >
                      {customerEmail ?? 'Not on file'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-500 font-medium block mb-1 flex items-center gap-1">
                      <MapPin className="size-3 text-slate-400" /> Delivery Address:
                    </span>
                    <p
                      className={cn(
                        'leading-relaxed',
                        customer.address ? 'font-semibold text-slate-800' : 'text-slate-400',
                      )}
                    >
                      {customer.address ?? 'Not on file'}
                    </p>
                  </div>
                </div>
              </div>

              {/* CLICKABLE ORDER HISTORY TRIGGER BUTTON */}
              <div className="pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  onClick={() => setHistoryModalOpen(true)}
                  className="w-full rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-3 text-xs shadow-md shadow-orange-500/20 flex items-center justify-between transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-4" />
                    <span>View Customer Orders ({customerOrders.length})</span>
                  </div>
                  <ChevronRight className="size-4" />
                </Button>
              </div>

            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* FULLY RESPONSIVE CUSTOMER ORDER HISTORY MODAL DIALOG */}
      <Dialog open={historyModalOpen} onOpenChange={setHistoryModalOpen}>
        <DialogContent className="w-[94vw] sm:max-w-2xl md:max-w-3xl rounded-3xl p-4 sm:p-6 md:p-8 bg-white max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200">
          <DialogHeader className="pb-3 sm:pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="font-display text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-2.5">
                  <ShoppingBag className="size-5 sm:size-6 text-orange-500 shrink-0" />
                  <span>Order History for {customer.name}</span>
                </DialogTitle>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1">
                  Showing all {customerOrders.length} orders placed • Total Spend: {formatCurrency(customer.totalSpend)}
                </p>
              </div>
            </div>
          </DialogHeader>

          {customerOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <ShoppingBag className="size-12 mx-auto text-slate-300" />
              <p className="text-sm font-semibold">No order history recorded for this customer.</p>
            </div>
          ) : (
            <div className="space-y-3 py-3 sm:py-4">
              {customerOrders.map((order) => {
                const status = orderStatusConfig[order.status]
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrderForDetail(order)}
                    className="group rounded-2xl border border-slate-200/90 bg-slate-50/60 p-3.5 sm:p-4 hover:bg-orange-50/80 hover:border-orange-300 transition-all duration-300 cursor-pointer shadow-2xs hover:-translate-y-0.5 hover:shadow-md space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-12 sm:items-center sm:gap-3"
                  >
                    {/* MOBILE TOP ROW (< sm): Order ID + Date + Status Badge */}
                    <div className="flex items-center justify-between gap-2 sm:hidden pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                          #{order.id}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                          <Calendar className="size-3 text-orange-400" />
                          {formatDateLong(order.placedAt)}
                        </span>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          'px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-2xs shrink-0',
                          status.badgeClass,
                        )}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    {/* DESKTOP COLUMN 1 & MOBILE BOTTOM ROW: Product Thumbnails + Items List */}
                    <div className="sm:col-span-6 flex items-center gap-3 min-w-0">
                      <div className="flex -space-x-2 shrink-0">
                        {order.items.slice(0, 3).map((item, i) => (
                          <img
                            key={i}
                            src={productImage(item.imageUrl)}
                            alt={item.name}
                            className="size-7.5 sm:size-8.5 rounded-lg border-2 border-white object-cover shadow-2xs transition-transform duration-300 group-hover:scale-110"
                          />
                        ))}
                      </div>

                      <div className="min-w-0 space-y-0.5 flex-1">
                        {/* Hidden on mobile, shown on desktop */}
                        <div className="hidden sm:flex sm:items-center sm:gap-2">
                          <span className="font-mono text-sm font-black text-slate-900 group-hover:text-orange-600 transition-colors">
                            #{order.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                            <Calendar className="size-3 text-orange-400" />
                            {formatDateLong(order.placedAt)}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {order.items.map((i) => i.name).join(', ')}
                        </p>
                      </div>
                    </div>

                    {/* DESKTOP COLUMN 2: STATUS BADGE (Hidden on mobile, shown on desktop) */}
                    <div className="hidden sm:flex sm:col-span-3 sm:justify-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          'w-28 justify-center py-1 text-xs font-bold rounded-full border shadow-2xs transition-transform duration-300 group-hover:scale-105',
                          status.badgeClass,
                        )}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    {/* DESKTOP COLUMN 3 & MOBILE PRICE ROW */}
                    <div className="flex items-center justify-between sm:justify-end sm:col-span-3 gap-2 text-right pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-xs font-semibold text-slate-500 sm:hidden">Total Amount:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-black text-slate-900 tabular-nums group-hover:text-orange-600 transition-colors">
                          {formatCurrency(order.total)}
                        </span>
                        <ChevronRight className="size-4 sm:size-4.5 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FULL ORDER DETAIL SHEET WHEN AN ORDER IS CLICKED FROM HISTORY */}
      <OrderDetailSheet
        order={selectedOrderForDetail}
        onOpenChange={(open) => !open && setSelectedOrderForDetail(null)}
        onStatusChange={handleStatusChange}
      />
    </>
  )
}
