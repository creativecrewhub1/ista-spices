import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import { supabaseAuth } from '@/lib/supabaseAuthClient'
import type {
  CheckoutInput,
  ItemInput,
  Order,
  OrderStatus,
  StockReceiptInput,
  UpdateProfileInput,
} from './types'

/**
 * Signs up the one admin account. The "only if none exists yet" rule is
 * enforced server-side (see auth.service.ts) — this call can't bypass it.
 * On success, immediately signs the new admin in.
 */
export function useSignUpAdmin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      await api.post('/auth/signup', { email, password })
      const { error } = await supabaseAuth.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-status'] })
    },
  })
}

/**
 * The single write path for stock items. Raw materials, B2B goods and
 * manufactured products differ by the category on the payload, not by
 * endpoint, so one mutation covers adding and editing all three.
 */
export function useSaveItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: ItemInput) => api.post('/items', item),
    onSuccess: invalidateItemViews(queryClient),
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => api.delete(`/items/${itemId}`),
    onSuccess: invalidateItemViews(queryClient),
  })
}

/** An item change moves through every list that reads it. */
function invalidateItemViews(queryClient: ReturnType<typeof useQueryClient>) {
  return () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
    queryClient.invalidateQueries({ queryKey: ['stock'] })
    queryClient.invalidateQueries({ queryKey: ['storefront-catalog'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-needs-attention'] })
  }
}
/** Places a storefront order — server resolves/creates the customer record and recomputes prices from the DB. */
export function useCheckout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CheckoutInput) => api.post<{ orderId: string }>('/storefront/orders', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storefront-orders'] })
    },
  })
}

/** Saves the signed-in customer's own profile edits. */
export function useUpdateMyProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => api.put('/storefront/me', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}

/** Permanently deletes the signed-in customer's account (blocked for the admin, server-side). */
export function useDeleteMyAccount() {
  return useMutation({
    mutationFn: () => api.delete('/storefront/me'),
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      api.patch(`/orders/${orderId}/status`, { status }),
    // The list is cached per filter/search combination, so the optimistic
    // patch has to reach every ['orders', ...] variant, not just a bare key.
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] })
      const previous = queryClient.getQueriesData<Order[]>({ queryKey: ['orders'] })
      queryClient.setQueriesData<Order[]>({ queryKey: ['orders'] }, (old) =>
        old?.map((order) => (order.id === orderId ? { ...order, status } : order)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      for (const [key, data] of context?.previous ?? []) {
        queryClient.setQueryData(key, data)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      // A status change moves an order between KPI buckets.
      queryClient.invalidateQueries({ queryKey: ['order-status-counts'] })
    },
  })
}

/** Stock in — the only path by which a purchase cost enters the system. */
export function useReceiveStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: StockReceiptInput) => api.post('/stock/receipts', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-needs-attention'] })
    },
  })
}

/** Recount or wastage. Signed quantity; a reason is required. */
export function useAdjustStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { itemId: string; qty: number; note: string }) =>
      api.post('/stock/adjustments', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock'] })
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-needs-attention'] })
    },
  })
}
