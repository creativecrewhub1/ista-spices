import { Link } from 'react-router-dom'
import { Flame, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/shop/CartContext'
import { useAuth } from '@/auth/AuthProvider'

export function ShopHeader() {
  const { count } = useCart()
  const { session, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-8">
      <Link to="/shop" className="flex items-center gap-2 font-heading text-lg font-semibold text-foreground">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Flame className="size-4" aria-hidden="true" />
        </span>
        Ista Spices
      </Link>
      <div className="flex items-center gap-1.5">
        {session ? (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/shop/orders">My orders</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              Sign out
            </Button>
          </>
        ) : null}
        <Button variant="outline" size="icon" className="relative" asChild>
          <Link to="/shop/cart" aria-label="Cart">
            <ShoppingCart className="size-4" aria-hidden="true" />
            {count > 0 ? (
              <span
                key={count}
                className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground motion-safe:animate-in motion-safe:zoom-in-75 duration-200"
              >
                {count}
              </span>
            ) : null}
          </Link>
        </Button>
      </div>
    </header>
  )
}
