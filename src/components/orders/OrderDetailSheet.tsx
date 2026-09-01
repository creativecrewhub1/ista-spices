import { useState } from 'react'
import { Check, Printer, Copy, MapPin, User, Mail, Phone, Clock, AlertTriangle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { productImage } from '@/lib/productImage'
import { cn } from '@/lib/utils'

const trackingSteps: OrderStatus[] = ['pending', 'processing', 'packed', 'shipped', 'delivered']

interface OrderDetailSheetProps {
  order: Order | null
  onOpenChange: (open: boolean) => void
  onStatusChange: (orderId: string, status: OrderStatus) => void
}

export function OrderDetailSheet({ order, onOpenChange, onStatusChange }: OrderDetailSheetProps) {
  const [copied, setCopied] = useState(false)

  if (!order) return null

  const currentStepIndex = trackingSteps.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  // Real contact details off the customer record — a walk-in customer added
  // by an admin may have neither on file.
  const customerEmail = order.customerEmail
  const customerPhone = order.customerPhone

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Sheet open={Boolean(order)} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto w-full sm:max-w-md p-6 bg-white border-l border-slate-200">
        
        {/* Header: Order ID & Quick Action Toolbar */}
        <SheetHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-2">
            <div>
              <SheetTitle className="font-display text-2xl font-black tracking-tight text-slate-900">
                Order #{order.id}
              </SheetTitle>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Placed on {formatDateLong(order.placedAt)}
              </p>
            </div>
            
            <Badge
              variant="outline"
              className={cn(
                'px-3 py-1 text-xs font-bold rounded-full border shadow-2xs',
                orderStatusConfig[order.status].badgeClass
              )}
            >
              {orderStatusConfig[order.status].label}
            </Badge>
          </div>

          {/* Reference Image Style Action Bar (Export, Print, Copy, Status) */}
          <div className="flex items-center gap-1.5 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-xl border-slate-200 bg-slate-50 hover:bg-orange-50 text-slate-700 text-xs font-semibold gap-1 py-1 px-2.5 h-8"
            >
              <Printer className="size-3.5 text-slate-500" />
              <span>Print</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyId}
              className="rounded-xl border-slate-200 bg-slate-50 hover:bg-orange-50 text-slate-700 text-xs font-semibold gap-1 py-1 px-2.5 h-8"
            >
              <Copy className="size-3.5 text-slate-500" />
              <span>{copied ? 'Copied!' : 'Copy ID'}</span>
            </Button>

            <div className="ml-auto min-w-[120px]">
              <Select value={order.status} onValueChange={(v: OrderStatus) => onStatusChange(order.id, v)}>
                <SelectTrigger className="rounded-xl border-orange-200 bg-orange-50/60 font-bold text-orange-700 text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-slate-200 p-1">
                  {Object.entries(orderStatusConfig).map(([value, config]) => (
                    <SelectItem key={value} value={value} className="rounded-xl font-semibold cursor-pointer">
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 py-5">
          
          {/* Tracking Step Progress Timeline */}
          {!isCancelled ? (
            <div className="rounded-2xl bg-slate-50/80 p-3.5 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                Fulfillment Progress
              </span>
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
                            index === 0 ? 'opacity-0' : isDone ? 'bg-orange-500' : 'bg-slate-200',
                          )}
                        />
                        <span
                          className={cn(
                            'flex size-5.5 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold transition-all',
                            isDone ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 bg-white text-slate-400',
                          )}
                        >
                          {isDone ? <Check className="size-3 stroke-[3]" /> : index + 1}
                        </span>
                        <div
                          className={cn(
                            'h-0.5 flex-1',
                            index === trackingSteps.length - 1
                              ? 'opacity-0'
                              : index < currentStepIndex
                                ? 'bg-orange-500'
                                : 'bg-slate-200',
                          )}
                        />
                      </div>
                      <span className="text-[9px] font-semibold leading-tight text-slate-600">
                        {config.label}
                      </span>
                    </li>
                  )
                })}
              </ol>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3 border border-rose-200 text-rose-700 text-xs font-semibold">
              <AlertTriangle className="size-4 shrink-0" />
              <span>This order was cancelled and will not be shipped.</span>
            </div>
          )}

          {/* ORDER ITEMS LIST (Matching Reference Mockup) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Order Items ({order.items.length})
              </h3>
              <span className="text-xs font-semibold text-slate-500 capitalize">
                {order.kind === 'subscription' ? '🔄 Subscription' : '📦 One-Time'}
              </span>
            </div>

            <div className="space-y-2.5">
              {order.items.map((item) => (
                <div
                  key={`${item.productId}-${item.packSize}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-slate-50 transition-colors"
                >
                  {/* Photo Thumbnail */}
                  <img
                    src={productImage(item.imageUrl)}
                    alt={item.name}
                    className="size-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                  />

                  {/* Name & Quantity Multiplier */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      <span className="text-orange-600 font-bold">{item.qty} ×</span> {formatCurrency(item.price)} ({item.packSize})
                    </p>
                  </div>

                  {/* Item Total Price */}
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs font-black text-slate-900">
                      {formatCurrency(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount Card */}
            <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 p-4 text-white shadow-md shadow-orange-500/20">
              <span className="text-xs font-bold uppercase tracking-wider">Total Amount Paid</span>
              <span className="font-mono text-xl font-black tabular-nums">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* CONTACTS SECTION (Matching Reference Mockup) */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="size-3.5 text-orange-500" /> Customer Contacts
            </h3>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Customer:</span>
                <span className="font-bold text-slate-900">{order.customerName}</span>
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
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Phone className="size-3 text-slate-400" /> Phone:
                </span>
                <span
                  className={cn(
                    'font-mono',
                    customerPhone ? 'font-semibold text-slate-800' : 'text-slate-400',
                  )}
                >
                  {customerPhone ?? 'Not on file'}
                </span>
              </div>
            </div>
          </div>

          {/* DELIVERY & ADDRESS SECTION */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <MapPin className="size-3.5 text-orange-500" /> Delivery Details
            </h3>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 font-medium block mb-0.5">Shipping Address:</span>
                <p className="font-semibold text-slate-800 leading-relaxed">{order.address}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="size-3 text-slate-400" /> Estimated Delivery:
                </span>
                <span className="font-bold text-slate-900">{formatTime(order.eta)}</span>
              </div>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}
