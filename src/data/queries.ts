import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type {
  AttentionItem,
  CatalogProduct,
  Customer,
  InventoryItem,
  Order,
  Product,
  ProductRevenueRow,
  RevenuePoint,
  RevenueSummary,
  TodaySummary,
} from './types'

export function useAuthStatus() {
  return useQuery({
    queryKey: ['auth-status'],
    queryFn: () => api.get<{ adminExists: boolean }>('/auth/status'),
    staleTime: 0,
  })
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<Product[]>('/products'),
  })
}

export function useInventoryItems() {
  return useQuery({
    queryKey: ['inventory-items'],
    queryFn: () => api.get<InventoryItem[]>('/inventory-items'),
  })
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get<Customer[]>('/customers'),
  })
}

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get<Order[]>('/orders'),
  })
}

export function useTodaySummary() {
  return useQuery({
    queryKey: ['dashboard-today'],
    queryFn: () => api.get<TodaySummary>('/dashboard/today'),
  })
}

export function useNeedsAttention() {
  return useQuery({
    queryKey: ['dashboard-needs-attention'],
    queryFn: () => api.get<{ items: AttentionItem[] }>('/dashboard/needs-attention'),
  })
}

export function useRevenueSummary() {
  return useQuery({
    queryKey: ['revenue-summary'],
    queryFn: () => api.get<RevenueSummary>('/revenue/summary'),
  })
}

/** Daily revenue for the trailing `days` days, zero-filled for gaps. */
export function useRevenueByDay(days: number) {
  return useQuery({
    queryKey: ['revenue-by-day', days],
    queryFn: () => api.get<RevenuePoint[]>(`/revenue/by-day?days=${days}`),
  })
}

/** Same as useRevenueByDay, but pre-aggregated server-side into weekly buckets (W1, W2, ...). */
export function useRevenueByWeek(days: number) {
  return useQuery({
    queryKey: ['revenue-by-week', days],
    queryFn: () => api.get<RevenuePoint[]>(`/revenue/by-day?days=${days}&bucket=week`),
  })
}

export function useRevenueByProduct() {
  return useQuery({
    queryKey: ['revenue-by-product'],
    queryFn: () => api.get<ProductRevenueRow[]>('/revenue/by-product'),
  })
}

/** Revenue trend for a single product over the trailing `days` days, zero-filled for gaps. */
export function useProductRevenueTrend(productId: string, days: number) {
  return useQuery({
    queryKey: ['revenue-by-product-by-day', productId, days],
    enabled: Boolean(productId),
    queryFn: () => api.get<RevenuePoint[]>(`/revenue/by-product/${productId}/trend?days=${days}`),
  })
}

/** Public catalog — reachable without a session, same as browsing before login. */
export function useCatalog() {
  return useQuery({
    queryKey: ['storefront-catalog'],
    queryFn: () => api.get<CatalogProduct[]>('/storefront/products'),
  })
}

/** The signed-in customer's own order history. */
export function useMyOrders() {
  return useQuery({
    queryKey: ['storefront-orders'],
    queryFn: () => api.get<Order[]>('/storefront/orders'),
  })
}
