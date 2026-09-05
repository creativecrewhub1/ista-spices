import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type {
  AttentionItem,
  CatalogProduct,
  Customer,
  CustomerCounts,
  DashboardKpis,
  InventoryItem,
  ItemCategoryOption,
  ItemInput,
  AuditEntry,
  ItemName,
  ProductionCosting,
  ProductionInputLine,
  ProductionRun,
  ItemRemovalCheck,
  RemovedItem,
  Order,
  OrderStatusEvent,
  OrderStatus,
  Product,
  ProductRevenueRow,
  RevenuePoint,
  RevenueSummary,
  StockItem,
  StockMovement,
  TodaySummary,
  UnitOfMeasure,
} from './types'

export function useAuthStatus() {
  return useQuery({
    queryKey: ['auth-status'],
    queryFn: () => api.get<{ adminExists: boolean }>('/auth/status'),
    staleTime: 0,
  })
}

export function useProducts(search?: string, enabled = true) {
  const queryString = search ? `?q=${encodeURIComponent(search)}` : ''
  return useQuery({
    queryKey: ['products', search ?? null],
    queryFn: () => api.get<Product[]>(`/products${queryString}`),
    placeholderData: (previous) => previous,
    enabled,
  })
}

export function useInventoryItems(
  filters: { type?: string; search?: string } = {},
  enabled = true,
) {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.search) params.set('q', filters.search)
  const queryString = params.toString()

  return useQuery({
    queryKey: ['inventory-items', filters.type ?? null, filters.search ?? null],
    queryFn: () => api.get<InventoryItem[]>(`/inventory-items${queryString ? `?${queryString}` : ''}`),
    placeholderData: (previous) => previous,
    enabled,
  })
}

export function useCustomers(filters: { search?: string; segment?: string; activity?: string } = {}) {
  const params = new URLSearchParams()
  if (filters.search) params.set('q', filters.search)
  if (filters.segment) params.set('segment', filters.segment)
  if (filters.activity) params.set('activity', filters.activity)
  const queryString = params.toString()

  return useQuery({
    queryKey: ['customers', filters.search ?? null, filters.segment ?? null, filters.activity ?? null],
    queryFn: () => api.get<Customer[]>(`/customers${queryString ? `?${queryString}` : ''}`),
    placeholderData: (previous) => previous,
  })
}

/** Whole-book tallies for the KPI tiles, independent of the active filter. */
export function useCustomerCounts() {
  return useQuery({
    queryKey: ['customer-counts'],
    queryFn: () => api.get<CustomerCounts>('/customers/counts'),
  })
}

/** A customer's order history, resolved by foreign key on the server. */
export function useCustomerOrders(customerId: string | null) {
  return useQuery({
    queryKey: ['customer-orders', customerId],
    queryFn: () => api.get<Order[]>(`/customers/${customerId}/orders`),
    enabled: Boolean(customerId),
  })
}

/** Recorded status transitions for one order — the real fulfilment timeline. */
export function useOrderStatusEvents(orderId: string | null) {
  return useQuery({
    queryKey: ['order-status-events', orderId],
    queryFn: () => api.get<OrderStatusEvent[]>(`/orders/${orderId}/events`),
    enabled: Boolean(orderId),
  })
}

/**
 * Admin order list. Status and search are applied server-side (indexed) —
 * `keepPreviousData` keeps the current rows on screen while a new filter
 * loads, so switching filters doesn't flash an empty list.
 */
export function useOrders(filters: { status?: string; search?: string } = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.search) params.set('q', filters.search)
  const queryString = params.toString()

  return useQuery({
    queryKey: ['orders', filters.status ?? null, filters.search ?? null],
    queryFn: () => api.get<Order[]>(`/orders${queryString ? `?${queryString}` : ''}`),
    placeholderData: (previous) => previous,
  })
}

/** Whole-business status tallies for the KPI tiles — independent of whatever
 * filter the order list is currently under, so the numbers never shift. */
export function useOrderStatusCounts() {
  return useQuery({
    queryKey: ['order-status-counts'],
    queryFn: () => api.get<Record<OrderStatus, number>>('/orders/counts'),
  })
}

/** The four headline figures, aggregated in Postgres. */
export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => api.get<DashboardKpis>('/dashboard/kpis'),
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

/** The signed-in customer's own profile — null until a customers row exists for them. */
export function useMyProfile() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<Customer | null>('/storefront/me'),
  })
}

/** Current stock position for every item — quantity, average cost, value. */
export function useStock() {
  return useQuery({
    queryKey: ['stock'],
    queryFn: () => api.get<StockItem[]>('/stock'),
  })
}

/** Movement history. Pass an itemId to narrow it to one item. */
export function useStockMovements(itemId?: string, limit = 50) {
  const params = new URLSearchParams()
  if (itemId) params.set('itemId', itemId)
  params.set('limit', String(limit))

  return useQuery({
    queryKey: ['stock-movements', itemId ?? null, limit],
    queryFn: () => api.get<StockMovement[]>(`/stock/movements?${params.toString()}`),
  })
}

/** The unit list the item form offers — served from the reference table so
 *  the options shown and the values the database accepts are one list. */
/** Everything that has happened to an item, newest first. */
export function useItemAudit(itemId: string | null) {
  return useQuery({
    queryKey: ['item-audit', itemId],
    queryFn: () => api.get<AuditEntry[]>(`/items/${itemId}/audit`),
    enabled: Boolean(itemId),
  })
}

/** What is keeping an item in the catalogue, asked when removal is offered. */
export function useRemovalCheck(itemId: string | null) {
  return useQuery({
    queryKey: ['item-removal-check', itemId],
    queryFn: () => api.get<ItemRemovalCheck>(`/items/${itemId}/removal-check`),
    enabled: Boolean(itemId),
  })
}

/**
 * What a batch would cost, drawing each material oldest batch first.
 *
 * A question rather than a change: it writes nothing, and it is keyed to the
 * quantities it describes, so it can never be showing a figure for numbers
 * that have since moved on.
 */
export function useProductionCosting(
  input: { inputs: ProductionInputLine[]; outputQty: number } | null,
) {
  return useQuery({
    queryKey: ['production-costing', input],
    queryFn: () => api.post<ProductionCosting>('/production/costing', input),
    enabled: Boolean(input),
    staleTime: 30_000,
  })
}

/** Batches already produced, newest first. */
export function useProductionRuns(limit = 20) {
  return useQuery({
    queryKey: ['production', limit],
    queryFn: () => api.get<ProductionRun[]>(`/production?limit=${limit}`),
  })
}

/** Items taken out of the catalogue, for the restore list. */
export function useRemovedItems(enabled = true) {
  return useQuery({
    queryKey: ['items-removed'],
    queryFn: () => api.get<RemovedItem[]>('/items/removed'),
    enabled,
  })
}

/** Names already on file, so the form can suggest as the admin types. */
export function useItemNames() {
  return useQuery({
    queryKey: ['item-names'],
    queryFn: () => api.get<ItemName[]>('/items/names'),
    staleTime: 60_000,
  })
}

export function useUnits() {
  return useQuery({
    queryKey: ['units'],
    queryFn: () => api.get<UnitOfMeasure[]>('/units'),
    staleTime: Infinity,
  })
}

/** The item categories the form offers — labels live beside the table the
 *  generated item_category column references, not in the client. */
export function useItemCategories() {
  return useQuery({
    queryKey: ['item-categories'],
    queryFn: () => api.get<ItemCategoryOption[]>('/item-categories'),
    staleTime: Infinity,
  })
}

/**
 * One item in the shape the edit form writes. The form must load from this
 * rather than reuse a list row: a list row carries what the list draws, and
 * any editable field missing from it would be invented and then saved over
 * the real value.
 */
export function useItem(id: string | null) {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => api.get<ItemInput>(`/items/${id}`),
    enabled: Boolean(id),
    refetchOnMount: 'always',
    staleTime: 0,
  })
}
