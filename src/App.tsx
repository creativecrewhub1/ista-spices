import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthProvider } from '@/auth/AuthProvider'
import { ProtectedRoute } from '@/auth/ProtectedRoute'
import { RequireSession } from '@/auth/RequireSession'
import { CartProvider } from '@/shop/CartContext'
import { LoginPage } from '@/pages/LoginPage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { StockPage } from '@/pages/StockPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { RevenuePage } from '@/pages/RevenuePage'
import { CustomersPage } from '@/pages/CustomersPage'
import { CatalogPage } from '@/pages/shop/CatalogPage'
import { ShopAllPage } from '@/pages/shop/ShopAllPage'
import { CartPage } from '@/pages/shop/CartPage'
import { CheckoutPage } from '@/pages/shop/CheckoutPage'
import { MyOrdersPage } from '@/pages/shop/MyOrdersPage'
import { ProfilePage } from '@/pages/shop/ProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Authentication */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Admin Panel (Primary Work Route) */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="stock" element={<StockPage />} />
                  <Route path="orders" element={<OrdersPage />} />
                  <Route path="revenue" element={<RevenuePage />} />
                  <Route path="customers" element={<CustomersPage />} />
                </Route>
              </Route>

              {/* Customer Storefront */}
              <Route path="/shop" element={<CatalogPage />} />
              <Route path="/shop/all" element={<ShopAllPage />} />
              <Route path="/shop/cart" element={<CartPage />} />
              <Route element={<RequireSession />}>
                <Route path="/shop/checkout" element={<CheckoutPage />} />
                <Route path="/shop/orders" element={<MyOrdersPage />} />
                <Route path="/shop/profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
