import { Link } from 'react-router-dom'
import { ShoppingBag, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProductVisual } from '../components/ProductVisual'
import { QuantityStepper } from '../components/QuantityStepper'
import { PriceTag, formatINR } from '../components/PriceTag'
import { EmptyState } from '../components/EmptyState'
import { useCart } from './CartContext'

export function CartDrawer() {
  const { lines, subtotal, isOpen, close, updateQty, removeItem } = useCart()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-lg">
            Your cart {lines.length > 0 ? `(${lines.length})` : ''}
          </SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Browse our spices and oils to find something worth cooking with."
            action={
              <Button asChild onClick={close}>
                <Link to="/shop">Start shopping</Link>
              </Button>
            }
          />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4">
              <ul className="flex flex-col divide-y divide-border">
                {lines.map((line) => (
                  <li key={`${line.productId}-${line.variantId}`} className="flex gap-3 py-4">
                    <Link to={`/product/${line.slug}`} onClick={close} className="shrink-0">
                      <ProductVisual accent={line.accent} className="size-20 rounded-md" iconClassName="size-6" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <Link to={`/product/${line.slug}`} onClick={close} className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{line.name}</p>
                          <p className="text-xs text-muted-foreground">{line.variantLabel}</p>
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(line.productId, line.variantId)}
                          aria-label={`Remove ${line.name} from cart`}
                          className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <QuantityStepper
                          size="sm"
                          value={line.qty}
                          onChange={(qty) => updateQty(line.productId, line.variantId, qty)}
                        />
                        <PriceTag price={line.price * line.qty} size="sm" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <SheetFooter className="border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums text-foreground">{formatINR(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
              <Separator className="my-1" />
              <Button asChild size="lg" className="w-full" onClick={close}>
                <Link to="/checkout">Checkout</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full" onClick={close}>
                <Link to="/cart">View cart</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
