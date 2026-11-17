import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { productImage } from '@/lib/productImage'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/shop/CartContext'
import { formatCurrency } from '@/lib/format'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { formatPack } from '@/lib/packLabel'
import { useCatalog, useUnits } from '@/data/queries'

export function CartPage() {
  const { data: units = [] } = useUnits()
  const { data: products = [] } = useCatalog()
  const { items, updateQty, total } = useCart()

  return (
    <div className={cn('storefront min-h-svh bg-[#fff9f2] pb-8 font-sans text-foreground', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 flex items-center gap-4">
          <Link to="/shop" aria-label="Back to shop" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#6a4b38] shadow-sm ring-1 ring-[#f1dfcb] transition-colors hover:text-[#e85d19]"><ArrowLeft className="size-5" /></Link>
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d85818]">Your selections</p><h1 className="font-display text-3xl font-semibold text-[#2b1b12] sm:text-4xl">Shopping cart</h1></div>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingBag className="size-6" aria-hidden="true" />
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
          <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
            <div>
              <ul className="flex flex-col gap-3">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.packQty}`}
                    className="relative flex items-center gap-3 rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-[#f0dfce] sm:gap-5 sm:p-5"
                  >
                    <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f7f1e9] sm:size-28">
                      <img src={productImage(item.imageUrl ?? products.find((product) => product.id === item.productId)?.imageUrl)} alt={item.productName} loading="lazy" className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1 self-stretch py-1">
                      <p className="pr-8 font-display text-base font-semibold text-[#2b1b12] sm:text-lg">{item.productName}</p>
                      <p className="mt-1 text-xs text-[#947968] sm:text-sm">
                        {formatPack(item.packQty, item.packUnit, units)} &middot; {formatCurrency(item.price)} each
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <div className="inline-flex h-9 items-center rounded-full border border-[#edc9aa] bg-[#fffaf5]">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-full hover:bg-[#fff0e3]"
                            aria-label={`Decrease ${item.productName} quantity`}
                            onClick={() => updateQty(item.productId, item.packQty, item.qty - 1)}
                          >
                            <Minus className="size-3.5" aria-hidden="true" />
                          </Button>
                          <span className="flex min-w-7 items-center justify-center text-sm font-semibold tabular-nums">
                            {item.qty}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-full hover:bg-[#fff0e3]"
                            aria-label={`Increase ${item.productName} quantity`}
                            onClick={() => updateQty(item.productId, item.packQty, item.qty + 1)}
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <span className="absolute bottom-4 right-4 shrink-0 text-sm font-bold tabular-nums text-[#2b1b12] sm:bottom-5 sm:right-5 sm:text-base">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                    <button type="button" onClick={() => updateQty(item.productId, item.packQty, 0)} aria-label={`Remove ${item.productName} from cart`} className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-[#f7f1e9] text-[#8d7565] transition-colors hover:bg-[#ffe9da] hover:text-[#d85818] sm:right-5 sm:top-5"><X className="size-4" aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
              <Button variant="link" asChild className="mt-5 px-0 text-[#d85818]">
                <Link to="/shop"><ArrowLeft className="size-4" /> Continue shopping</Link>
              </Button>
            </div>

            <aside className="flex h-fit flex-col gap-5 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-[#f0dfce] sm:p-6 lg:sticky lg:top-24">
              <h2 className="font-display text-xl font-semibold text-[#2b1b12]">Order summary</h2>
              <div className="flex justify-between text-sm">
                <span className="text-[#8d7565]">Subtotal</span>
                <span className="font-semibold tabular-nums text-[#2b1b12]">{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-[#947968]">Shipping and taxes calculated at checkout.</p>
              <Separator />
              <div className="flex justify-between text-base font-medium">
                <span className="font-semibold text-[#2b1b12]">Total</span>
                <span className="font-bold tabular-nums text-[#2b1b12]">{formatCurrency(total)}</span>
              </div>
              <Button size="lg" className="h-12 w-full rounded-full bg-[#e85d19] font-semibold text-white hover:bg-[#c94d11]" asChild>
                <Link to="/shop/checkout">Proceed to checkout <ArrowRight className="size-4" /></Link>
              </Button>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
