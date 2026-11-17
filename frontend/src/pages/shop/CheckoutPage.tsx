import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { productImage } from '@/lib/productImage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/shop/CartContext'
import { useCheckout } from '@/data/mutations'
import { formatCurrency } from '@/lib/format'
import { pageEnter } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { formatPack } from '@/lib/packLabel'
import { useCatalog, useUnits } from '@/data/queries'

// Reaching this page at all requires a session — see RequireSession in App.tsx.
export function CheckoutPage() {
  const { data: units = [] } = useUnits()
  const { data: products = [] } = useCatalog()
  const { items, total, clear } = useCart()
  const checkout = useCheckout()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  if (items.length === 0 && !checkout.isSuccess) {
    return <Navigate to="/shop/cart" replace />
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    checkout.mutate(
      {
        items: items.map((item) => ({ productId: item.productId, packQty: item.packQty, qty: item.qty })),
        address,
        name,
        phone,
      },
      {
        onSuccess: (result) => {
          clear()
          navigate('/shop/orders', { state: { justPlaced: result.orderId } })
        },
      },
    )
  }

  return (
    <div className={cn('storefront min-h-svh bg-[#fff9f2] pb-10 font-sans text-foreground', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-7 flex items-center gap-4">
          <Link to="/shop/cart" aria-label="Back to cart" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-[#6a4b38] shadow-sm ring-1 ring-[#f1dfcb] transition-colors hover:text-[#e85d19]"><ArrowLeft className="size-5" /></Link>
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d85818]">Almost there</p><h1 className="font-display text-3xl font-semibold text-[#2b1b12] sm:text-4xl">Checkout</h1></div>
        </div>

        <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <form
            className="flex flex-col gap-5 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-[#f0dfce] sm:p-7"
            onSubmit={handleSubmit}
          >
            <div><h2 className="font-display text-xl font-semibold text-[#2b1b12]">Delivery details</h2><p className="mt-1 text-sm text-[#947968]">Where should we send your order?</p></div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-name">Full name</Label>
              <Input id="checkout-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl border-[#edc9aa] bg-[#fffdf9] focus-visible:ring-[#e85d19]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-phone">Phone</Label>
              <Input
                id="checkout-phone"
                type="tel"
                required
                autoComplete="tel"
                pattern="[0-9+() -]{7,20}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 rounded-xl border-[#edc9aa] bg-[#fffdf9] focus-visible:ring-[#e85d19]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-address">Delivery address</Label>
              <Textarea
                id="checkout-address"
                required
                autoComplete="street-address"
                rows={4}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-xl border-[#edc9aa] bg-[#fffdf9] focus-visible:ring-[#e85d19]"
              />
            </div>
            {checkout.isError ? (
              <p className="text-sm text-destructive">{(checkout.error as Error).message}</p>
            ) : null}
            <Button type="submit" size="lg" disabled={checkout.isPending} className="mt-1 h-12 w-full gap-2 rounded-full bg-[#e85d19] font-semibold text-white hover:bg-[#c94d11]">
              {checkout.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Place order &middot; {formatCurrency(total)}
            </Button>
          </form>

          <aside className="flex h-fit flex-col gap-5 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-[#f0dfce] sm:p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-xl font-semibold text-[#2b1b12]">Your order</h2>
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={`${item.productId}-${item.packQty}`} className="flex items-center gap-3">
                  <div className="relative flex size-14 shrink-0 items-center justify-center overflow-visible rounded-xl bg-[#f7f1e9]">
                    <img src={productImage(item.imageUrl ?? products.find((product) => product.id === item.productId)?.imageUrl)} alt={item.productName} loading="lazy" className="h-full w-full rounded-xl object-contain" />
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#e85d19] text-[10px] font-semibold text-white">
                      {item.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#2b1b12]">{item.productName}</p>
                    <p className="text-xs text-[#947968]">{formatPack(item.packQty, item.packUnit, units)} · {item.qty} × {formatCurrency(item.price)}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-[#2b1b12]">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="flex justify-between text-sm"><span className="text-[#947968]">Subtotal</span><span className="font-semibold tabular-nums text-[#2b1b12]">{formatCurrency(total)}</span></div>
            <p className="text-xs text-[#947968]">Shipping and taxes calculated at checkout.</p>
            <div className="flex justify-between text-base font-medium">
              <span className="font-semibold text-[#2b1b12]">Total</span>
              <span className="font-bold tabular-nums text-[#2b1b12]">{formatCurrency(total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
