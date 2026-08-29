import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { ShopHeader } from '@/components/shop/ShopHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
    <div className={cn('pb-8', pageEnter)}>
      <ShopHeader />
      <div className="mx-auto max-w-md px-4 py-6 md:px-8">
        <h1 className="mb-6 font-heading text-xl font-semibold">Checkout</h1>

        <Card className="mb-4">
          <CardContent className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{items.length} item(s)</span>
            <span className="font-mono text-lg font-semibold tabular-nums">{formatCurrency(total)}</span>
          </CardContent>
        </Card>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          {checkout.isError ? (
            <p className="text-sm text-destructive">{(checkout.error as Error).message}</p>
          ) : null}
          <Button type="submit" size="lg" disabled={checkout.isPending} className="gap-1.5">
            {checkout.isPending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Place order · {formatCurrency(total)}
          </Button>
        </form>
      </div>
    </div>
  )
}
