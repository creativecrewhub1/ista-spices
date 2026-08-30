import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { CartProvider } from '../cart/CartContext'
import { CartDrawer } from '../cart/CartDrawer'
import { WishlistProvider } from '../wishlist/WishlistContext'
import { SearchProvider } from '../search/SearchContext'
import { SearchOverlay } from '../search/SearchOverlay'
import { Toaster } from '@/components/ui/sonner'

export function StorefrontLayout() {
  return (
    <div className="storefront flex min-h-svh flex-col bg-background font-sans text-foreground antialiased">
      <CartProvider>
        <WishlistProvider>
          <SearchProvider>
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <CartDrawer />
            <SearchOverlay />
            <Toaster position="bottom-center" />
          </SearchProvider>
        </WishlistProvider>
      </CartProvider>
    </div>
  )
}
