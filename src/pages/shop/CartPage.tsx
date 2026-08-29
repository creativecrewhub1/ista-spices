import { Link } from 'react-router-dom'
import { Minus, Plus } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/shop/CartContext'
import { formatCurrency } from '@/lib/format'

export function CartPage() {
  const { items, updateQty, total } = useCart()

  return (
    <div className="pb-8">
      <ShopHeader />
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-8">
        <h1 className="mb-6 font-heading text-xl font-semibold">Your cart</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button asChild>
              <Link to="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="flex flex-col divide-y divide-border p-0">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.packSize}`} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.packSize} · {formatCurrency(item.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Decrease quantity"
                        onClick={() => updateQty(item.productId, item.packSize, item.qty - 1)}
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </Button>
                      <span className="w-6 text-center font-mono text-sm tabular-nums">{item.qty}</span>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        aria-label="Increase quantity"
                        onClick={() => updateQty(item.productId, item.packSize, item.qty + 1)}
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </Button>
                    </div>
                    <span className="w-16 text-right font-mono text-sm font-semibold tabular-nums">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between px-1">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-mono text-lg font-semibold tabular-nums">{formatCurrency(total)}</span>
            </div>

            <Button size="lg" asChild>
              <Link to="/shop/checkout">Proceed to checkout</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
