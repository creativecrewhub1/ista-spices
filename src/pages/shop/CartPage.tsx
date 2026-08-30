import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { ProductMonogram } from '@/components/shop/ProductVisual'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/shop/CartContext'
import { formatCurrency } from '@/lib/format'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function CartPage() {
  const { items, updateQty, total } = useCart()

  return (
    <div className={cn('storefront min-h-svh bg-background pb-8 font-sans text-foreground', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <h1 className="mb-6 font-display text-3xl font-medium text-foreground sm:text-4xl">Your cart</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ShoppingBag className="size-5" aria-hidden="true" />
            </span>
            <p className="font-display text-xl text-foreground">Your cart is empty</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Browse our spices and oils to find something worth cooking with.
            </p>
            <Button asChild className="mt-2">
              <Link to="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
            <div>
              <ul className="flex flex-col divide-y divide-border border-y border-border">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.packSize}`} className="flex items-center gap-4 py-5">
                    <ProductMonogram id={item.productId} name={item.productName} className="size-16" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.packSize} &middot; {formatCurrency(item.price)} each
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="inline-flex h-8 items-center rounded-md border border-border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-none rounded-l-md hover:bg-muted"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(item.productId, item.packSize, item.qty - 1)}
                          >
                            <Minus className="size-3.5" aria-hidden="true" />
                          </Button>
                          <span className="flex min-w-8 items-center justify-center font-mono text-sm tabular-nums">
                            {item.qty}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-none rounded-r-md hover:bg-muted"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(item.productId, item.packSize, item.qty + 1)}
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateQty(item.productId, item.packSize, 0)}
                          aria-label={`Remove ${item.productName} from cart`}
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <span className="shrink-0 font-medium tabular-nums text-foreground">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <Button variant="link" asChild className="mt-4 px-0">
                <Link to="/shop">Continue shopping</Link>
              </Button>
            </div>

            <aside className="flex h-fit flex-col gap-4 rounded-md border border-border p-6 lg:sticky lg:top-24">
              <h2 className="text-sm font-medium text-foreground">Order summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums text-foreground">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
              <Separator />
              <div className="flex justify-between text-base font-medium">
                <span className="text-foreground">Total</span>
                <span className="tabular-nums text-foreground">{formatCurrency(total)}</span>
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link to="/shop/checkout">Proceed to checkout</Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
