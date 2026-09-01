import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const FOOTER_LINKS = [
  {
    heading: 'Shop',
    links: [
      { label: 'Spice Powders', to: '/shop?category=spice-powders' },
      { label: 'House Blends', to: '/shop?category=blends' },
      { label: 'Cooking Oils', to: '/shop?category=cooking-oils' },
      { label: 'Gift Sets', to: '/shop?category=gift-sets' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Our Story', to: '/about' },
      { label: 'Sourcing & Farms', to: '/about' },
      { label: 'Contact', to: '/about' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Shipping & Returns', to: '/about' },
      { label: 'FAQs', to: '/about' },
      { label: 'Track an Order', to: '/account/orders' },
    ],
  },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Flame className="size-4" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-medium text-foreground">Ista Spices</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Small-batch spices and cold-pressed oils, sourced directly from farms across India and ground fresh
              to order.
            </p>
            <form onSubmit={handleSubmit} className="mt-2 flex max-w-sm flex-col gap-2 sm:flex-row">
              <Input
                type="email"
                required
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
                className="bg-background"
              />
              <Button type="submit" variant="outline" className="shrink-0">
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-muted-foreground" role="status">
              {submitted ? 'Thanks — you\'re on the list.' : 'One email a month. No spam, ever.'}
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.heading} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-foreground">{group.heading}</h3>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Ista Spices. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/about" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/about" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
