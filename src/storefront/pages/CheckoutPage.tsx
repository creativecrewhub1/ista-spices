import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Check, CreditCard, Landmark, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ProductVisual } from '../components/ProductVisual'
import { productImage } from '../data/images'
import { PriceTag, formatINR } from '../components/PriceTag'
import { useCart } from '../cart/CartContext'
import { cn } from '@/lib/utils'

type Step = 'shipping' | 'payment' | 'review'
const STEPS: { id: Step; label: string }[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
]

interface ShippingForm {
  name: string
  email: string
  phone: string
  line1: string
  city: string
  state: string
  pincode: string
}

const EMPTY_SHIPPING: ShippingForm = { name: '', email: '', phone: '', line1: '', city: '', state: '', pincode: '' }

export function CheckoutPage() {
  const { lines, subtotal, clear } = useCart()
  const [step, setStep] = useState<Step>('shipping')
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING)
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({})
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [placed, setPlaced] = useState(false)
  const [orderId] = useState(() => `ORD-${Math.floor(9000 + Math.random() * 999)}`)

  const shippingCost = subtotal >= 999 || subtotal === 0 ? 0 : 79
  const total = subtotal + shippingCost
  const stepIndex = STEPS.findIndex((s) => s.id === step)

  if (lines.length === 0 && !placed) {
    return <Navigate to="/cart" replace />
  }

  function validateShipping(): boolean {
    const next: Partial<Record<keyof ShippingForm, string>> = {}
    if (!shipping.name.trim()) next.name = 'Full name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) next.email = 'Enter a valid email'
    if (!/^\d{10}$/.test(shipping.phone)) next.phone = 'Enter a 10-digit phone number'
    if (!shipping.line1.trim()) next.line1 = 'Address is required'
    if (!shipping.city.trim()) next.city = 'City is required'
    if (!shipping.state.trim()) next.state = 'State is required'
    if (!/^\d{6}$/.test(shipping.pincode)) next.pincode = 'Enter a 6-digit pincode'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleShippingSubmit(e: FormEvent) {
    e.preventDefault()
    if (validateShipping()) setStep('payment')
  }

  function handlePlaceOrder() {
    setPlaced(true)
    clear()
  }

  if (placed) {
    return (
      <div className="band-cream mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-medium text-foreground">Order confirmed</h1>
        <p className="text-muted-foreground">
          Thank you, {shipping.name.split(' ')[0] || 'friend'} — your order{' '}
          <span className="font-medium text-foreground">{orderId}</span> has been placed. A confirmation has been
          sent to {shipping.email}.
        </p>
        <div className="mt-4 flex gap-3">
          <Button asChild>
            <Link to="/shop">Continue shopping</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/account/orders">View orders</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="band-cream mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Step indicator */}
      <ol className="mb-10 flex items-center justify-center gap-3 sm:gap-6">
        {STEPS.map((s, i) => (
          <li key={s.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium',
                  i < stepIndex && 'border-foreground bg-foreground text-primary-foreground',
                  i === stepIndex && 'border-foreground text-foreground',
                  i > stepIndex && 'border-border text-muted-foreground',
                )}
              >
                {i < stepIndex ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
              </span>
              <span className={cn('hidden text-sm sm:inline', i === stepIndex ? 'text-foreground' : 'text-muted-foreground')}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 ? <span className="h-px w-6 bg-border sm:w-12" /> : null}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
        <div>
          {step === 'shipping' ? (
            <form className="flex flex-col gap-5" onSubmit={handleShippingSubmit} noValidate>
              <h1 className="font-display text-2xl font-medium text-foreground">Shipping details</h1>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  autoComplete="name"
                  value={shipping.name}
                  onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name ? <p id="name-error" className="text-xs text-destructive">{errors.name}</p> : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={shipping.email}
                    onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {errors.email ? <p id="email-error" className="text-xs text-destructive">{errors.email}</p> : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone ? <p id="phone-error" className="text-xs text-destructive">{errors.phone}</p> : null}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="line1">Address</Label>
                <Input
                  id="line1"
                  autoComplete="address-line1"
                  value={shipping.line1}
                  onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
                  aria-invalid={Boolean(errors.line1)}
                  aria-describedby={errors.line1 ? 'line1-error' : undefined}
                />
                {errors.line1 ? <p id="line1-error" className="text-xs text-destructive">{errors.line1}</p> : null}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    autoComplete="address-level2"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    aria-invalid={Boolean(errors.city)}
                  />
                  {errors.city ? <p className="text-xs text-destructive">{errors.city}</p> : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    autoComplete="address-level1"
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    aria-invalid={Boolean(errors.state)}
                  />
                  {errors.state ? <p className="text-xs text-destructive">{errors.state}</p> : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={shipping.pincode}
                    onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                    aria-invalid={Boolean(errors.pincode)}
                  />
                  {errors.pincode ? <p className="text-xs text-destructive">{errors.pincode}</p> : null}
                </div>
              </div>

              <Button type="submit" size="lg" className="mt-2 w-full sm:w-auto">
                Continue to payment
              </Button>
            </form>
          ) : null}

          {step === 'payment' ? (
            <div className="flex flex-col gap-5">
              <h1 className="font-display text-2xl font-medium text-foreground">Payment method</h1>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex flex-col gap-3">
                {[
                  { id: 'upi', label: 'UPI', icon: Wallet, hint: 'Pay via any UPI app' },
                  { id: 'card', label: 'Credit / Debit card', icon: CreditCard, hint: 'Visa, Mastercard, RuPay' },
                  { id: 'cod', label: 'Cash on delivery', icon: Landmark, hint: 'Pay when your order arrives' },
                ].map((method) => (
                  <Label
                    key={method.id}
                    htmlFor={`pay-${method.id}`}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary',
                    )}
                  >
                    <RadioGroupItem value={method.id} id={`pay-${method.id}`} />
                    <method.icon className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-foreground">{method.label}</span>
                      <span className="block text-xs text-muted-foreground">{method.hint}</span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>

              {paymentMethod === 'card' ? (
                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="card-number">Card number</Label>
                    <Input id="card-number" inputMode="numeric" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="card-expiry">Expiry</Label>
                    <Input id="card-expiry" placeholder="MM/YY" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input id="card-cvv" inputMode="numeric" placeholder="123" />
                  </div>
                </div>
              ) : null}

              <div className="mt-2 flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep('shipping')}>
                  Back
                </Button>
                <Button size="lg" onClick={() => setStep('review')}>
                  Continue to review
                </Button>
              </div>
            </div>
          ) : null}

          {step === 'review' ? (
            <div className="flex flex-col gap-6">
              <h1 className="font-display text-2xl font-medium text-foreground">Review your order</h1>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-foreground">Shipping to</h2>
                  <button type="button" onClick={() => setStep('shipping')} className="text-xs text-accent hover:underline">
                    Edit
                  </button>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {shipping.name} &middot; {shipping.phone}
                  <br />
                  {shipping.line1}, {shipping.city}, {shipping.state} {shipping.pincode}
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-foreground">Payment method</h2>
                  <button type="button" onClick={() => setStep('payment')} className="text-xs text-accent hover:underline">
                    Edit
                  </button>
                </div>
                <p className="mt-1.5 text-sm capitalize text-muted-foreground">
                  {paymentMethod === 'cod' ? 'Cash on delivery' : paymentMethod === 'upi' ? 'UPI' : 'Credit / Debit card'}
                </p>
              </div>

              <ul className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
                {lines.map((line) => (
                  <li key={`${line.productId}-${line.variantId}`} className="flex items-center gap-3 p-4">
                    <ProductVisual accent={line.accent} src={productImage(line.slug)} alt={line.name} fit="contain" backdrop={productImage(line.slug) ? 'sand' : 'accent'} className="size-14 shrink-0 rounded-xl" iconClassName="size-5" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{line.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {line.variantLabel} &middot; Qty {line.qty}
                      </p>
                    </div>
                    <PriceTag price={line.price * line.qty} size="sm" />
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <Button variant="outline" size="lg" onClick={() => setStep('payment')}>
                  Back
                </Button>
                <Button size="lg" className="flex-1" onClick={handlePlaceOrder}>
                  Place order &middot; {formatINR(total)}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Order summary */}
        <aside className="flex h-fit flex-col gap-4 rounded-2xl border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-medium text-foreground">Order summary</h2>
          <ul className="flex flex-col gap-3">
            {lines.map((line) => (
              <li key={`${line.productId}-${line.variantId}`} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <ProductVisual accent={line.accent} src={productImage(line.slug)} alt={line.name} fit="contain" backdrop={productImage(line.slug) ? 'sand' : 'accent'} className="size-12 rounded-xl" iconClassName="size-4" />
                  <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-medium text-primary-foreground">
                    {line.qty}
                  </span>
                </div>
                <p className="min-w-0 flex-1 truncate text-sm text-foreground">{line.name}</p>
                <PriceTag price={line.price * line.qty} size="sm" />
              </li>
            ))}
          </ul>
          <Separator />
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums text-foreground">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums text-foreground">{shippingCost === 0 ? 'Free' : formatINR(shippingCost)}</span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between text-base font-medium">
            <span className="text-foreground">Total</span>
            <span className="tabular-nums text-foreground">{formatINR(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
