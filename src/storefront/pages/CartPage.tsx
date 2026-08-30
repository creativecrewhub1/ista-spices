import { Link } from 'react-router-dom'
import { ShoppingBag, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ProductVisual } from '../components/ProductVisual'
import { QuantityStepper } from '../components/QuantityStepper'
import { PriceTag, formatINR } from '../components/PriceTag'
import { EmptyState } from '../components/EmptyState'
import { useCart } from '../cart/CartContext'

export function CartPage() {
  const { lines, subtotal, updateQty, removeItem } = useCart()
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79
  const total = subtotal + shipping

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse our spices and oils to find something worth cooking with."
          action={
            <Button asChild>
              <Link to="/shop">Start shopping</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
      <h1 className="mt-4 font-display text-3xl font-medium text-foreground sm:text-4xl">Your cart</h1>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
        <div>
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {lines.map((line) => (
              <li key={`${line.productId}-${line.variantId}`} className="flex gap-4 py-6">
                <Link to={`/product/${line.slug}`} className="shrink-0">
                  <ProductVisual accent={line.accent} className="size-24 rounded-md sm:size-28" iconClassName="size-8" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/product/${line.slug}`}>
                        <p className="truncate text-base font-medium text-foreground">{line.name}</p>
                      </Link>
                      <p className="text-sm text-muted-foreground">{line.variantLabel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(line.productId, line.variantId)}
                      aria-label={`Remove ${line.name} from cart`}
                      className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <QuantityStepper value={line.qty} onChange={(qty) => updateQty(line.productId, line.variantId, qty)} />
                    <PriceTag price={line.price * line.qty} />
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Button variant="link" asChild className="px-0">
              <Link to="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>

        <aside className="flex flex-col gap-5 rounded-md border border-border p-6 lg:sticky lg:top-24 lg:h-fit">
          <h2 className="text-base font-medium text-foreground">Order summary</h2>

          <div className="flex gap-2">
            <Input placeholder="Discount code" aria-label="Discount code" />
            <Button variant="outline">Apply</Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums text-foreground">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums text-foreground">{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between text-base font-medium">
            <span className="text-foreground">Total</span>
            <span className="tabular-nums text-foreground">{formatINR(total)}</span>
          </div>

          <Button asChild size="lg" className="w-full">
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <p className="text-center text-xs text-muted-foreground">Taxes calculated at checkout.</p>
        </aside>
      </div>
    </div>
  )
}
