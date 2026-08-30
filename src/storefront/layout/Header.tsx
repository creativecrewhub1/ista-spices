import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Flame, Heart, Menu, Search, ShoppingBag, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCart } from '../cart/CartContext'
import { useWishlist } from '../wishlist/WishlistContext'
import { useSearch } from '../search/SearchContext'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Shop All', to: '/shop' },
  { label: 'Spice Powders', to: '/shop?category=spice-powders' },
  { label: 'Cooking Oils', to: '/shop?category=cooking-oils' },
  { label: 'Gift Sets', to: '/shop?category=gift-sets' },
  { label: 'Our Story', to: '/about' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount, open: openCart } = useCart()
  const { ids: wishlistIds } = useWishlist()
  const { open: openSearch } = useSearch()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Flame className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-foreground">Ista Spices</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'text-sm text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={openSearch}>
            <Search className="size-[1.15rem]" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative hidden sm:inline-flex" asChild>
            <Link to="/account/wishlist">
              <Heart className="size-[1.15rem]" aria-hidden="true" />
              {wishlistIds.size > 0 ? (
                <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                  {wishlistIds.size}
                </span>
              ) : null}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Account" className="hidden sm:inline-flex" asChild>
            <Link to="/account">
              <User className="size-[1.15rem]" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label={`Cart, ${itemCount} items`} className="relative" onClick={openCart}>
            <ShoppingBag className="size-[1.15rem]" aria-hidden="true" />
            {itemCount > 0 ? (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                {itemCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm">
          <SheetHeader>
            <SheetTitle className="font-display text-lg">Ista Spices</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col px-4" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border py-3.5 text-base text-foreground last:border-none"
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-1 border-t border-border px-4 py-4">
            <Link
              to="/account"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm text-foreground hover:bg-muted"
            >
              <User className="size-4" aria-hidden="true" /> Account
            </Link>
            <Link
              to="/account/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm text-foreground hover:bg-muted"
            >
              <Heart className="size-4" aria-hidden="true" /> Wishlist
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
