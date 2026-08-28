import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { InventoryPage } from '@/pages/InventoryPage'
import { OrdersPage } from '@/pages/OrdersPage'
import { RevenuePage } from '@/pages/RevenuePage'
import { CustomersPage } from '@/pages/CustomersPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="revenue" element={<RevenuePage />} />
          <Route path="customers" element={<CustomersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
