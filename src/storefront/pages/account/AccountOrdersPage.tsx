import { Package } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { EmptyState } from '../../components/EmptyState'
import { formatINR } from '../../components/PriceTag'
import { mockOrders } from '../../data/account'
import { OrderStatusBadge } from './OrderStatusBadge'

export function AccountOrdersPage() {
  if (mockOrders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you place an order, it will show up here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-medium text-foreground">Order history</h2>
      <Accordion type="single" collapsible className="rounded-md border border-border">
        {mockOrders.map((order, index) => (
          <AccordionItem key={order.id} value={order.id} className={index === mockOrders.length - 1 ? 'border-none' : ''}>
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-1 flex-col items-start gap-1 text-left sm:flex-row sm:items-center sm:justify-between sm:pr-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={order.status} />
                  <span className="text-sm font-medium tabular-nums text-foreground">{formatINR(order.total)}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4">
              <ul className="flex flex-col gap-2 border-t border-border pt-3">
                {order.items.map((item) => (
                  <li key={`${order.id}-${item.name}`} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      {item.qty} &times; {item.name} <span className="text-muted-foreground">({item.variant})</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">{formatINR(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-end">
                <Button variant="outline" size="sm">
                  {order.status === 'delivered' ? 'Buy again' : 'Track order'}
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
