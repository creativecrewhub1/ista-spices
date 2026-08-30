import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { ProductMonogram } from '@/components/shop/ProductVisual'
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

// Reaching this page at all requires a session — see RequireSession in App.tsx.
export function CheckoutPage() {
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
        items: items.map((item) => ({ productId: item.productId, packSize: item.packSize, qty: item.qty })),
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
    <div className={cn('storefront min-h-svh bg-background pb-8 font-sans text-foreground', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <h1 className="mb-8 font-display text-3xl font-bold text-foreground sm:text-4xl">Checkout</h1>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
          <form
            className="flex flex-col gap-5 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/5"
            onSubmit={handleSubmit}
            noValidate
          >
            <h2 className="text-sm font-medium text-foreground">Delivery details</h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-name">Full name</Label>
              <Input id="checkout-name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-phone">Phone</Label>
              <Input
                id="checkout-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="checkout-address">Delivery address</Label>
              <Textarea
                id="checkout-address"
                required
                rows={4}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            {checkout.isError ? (
              <p className="text-sm text-destructive">{(checkout.error as Error).message}</p>
            ) : null}
            <Button type="submit" size="lg" disabled={checkout.isPending} className="mt-1 w-full gap-1.5 sm:w-auto">
              {checkout.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
              Place order &middot; {formatCurrency(total)}
            </Button>
          </form>

          <aside className="flex h-fit flex-col gap-4 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/5 lg:sticky lg:top-24">
            <h2 className="text-sm font-medium text-foreground">Order summary</h2>
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={`${item.productId}-${item.packSize}`} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <ProductMonogram id={item.productId} name={item.productName} className="size-11" />
                    <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {item.qty}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">{item.packSize}</p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-foreground">
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="flex justify-between text-base font-medium">
              <span className="text-foreground">Total</span>
              <span className="tabular-nums text-foreground">{formatCurrency(total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
