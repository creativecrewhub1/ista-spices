import { Link } from 'react-router-dom'
import { Flame, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AccountMenu } from './AccountMenu'
import { useCart } from '@/shop/CartContext'
import { useAuth } from '@/auth/AuthProvider'

export function ShopHeader() {
  const { count } = useCart()
  const { session } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/shop" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Flame className="size-4" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">Ista Spices</span>
        </Link>

        <div className="flex items-center gap-2">
          {session ? <AccountMenu /> : null}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/shop/cart" aria-label={`Cart, ${count} items`}>
              <ShoppingBag className="size-[1.15rem]" aria-hidden="true" />
              {count > 0 ? (
                <span
                  key={count}
                  className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground motion-safe:animate-in motion-safe:zoom-in-75 duration-200"
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
