import { Link } from 'react-router-dom'
import { Flame, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/shop/CartContext'
import { useAuth } from '@/auth/AuthProvider'

export function ShopHeader() {
  const { count } = useCart()
  const { session, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/shop" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Flame className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-medium tracking-tight text-foreground">Ista Spices</span>
        </Link>

        <div className="flex items-center gap-1">
          {session ? (
            <>
              <Button variant="ghost" size="sm" className="hidden gap-1.5 text-muted-foreground sm:inline-flex" asChild>
                <Link to="/shop/orders">
                  <Package className="size-4" aria-hidden="true" />
                  My orders
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : null}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/shop/cart" aria-label={`Cart, ${count} items`}>
              <ShoppingBag className="size-[1.15rem]" aria-hidden="true" />
              {count > 0 ? (
                <span
                  key={count}
                  className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground motion-safe:animate-in motion-safe:zoom-in-75 duration-200"
                >
                  {count}
                </span>
              ) : null}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
