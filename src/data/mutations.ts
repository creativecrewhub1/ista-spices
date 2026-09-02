import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import { supabaseAuth } from '@/lib/supabaseAuthClient'
import type { CheckoutInput, InventoryItem, Order, OrderStatus, Product } from './types'

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

export function useSaveProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (product: Product) => api.post('/products', product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['revenue-by-product'] })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => api.delete(`/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useSaveInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: InventoryItem) => api.post('/inventory-items', item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
    },
  })
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => api.delete(`/inventory-items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
    },
  })
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
