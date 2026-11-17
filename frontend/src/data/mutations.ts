import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import { supabaseAuth } from '@/lib/supabaseAuthClient'
import type {
  CheckoutInput,
  ItemInput,
  Order,
  CustomerSegment,
  OrderStatus,
  ProductionRunInput,
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

export function useRestoreItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (itemId: string) => api.post(`/items/${itemId}/restore`, {}),
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
  return () =>
    Promise.all([
    // The edit form reads this one. Without it a save is written, the sheet
    // closes, and reopening serves the copy from before the save — the item
    // looks unchanged while the database holds the new value.
    queryClient.invalidateQueries({ queryKey: ['item'] }),
    // What is blocking removal moves with the item and with its stock.
    queryClient.invalidateQueries({ queryKey: ['item-removal-check'] }),
    queryClient.invalidateQueries({ queryKey: ['products'] }),
    queryClient.invalidateQueries({ queryKey: ['inventory-items'] }),
    // Without this the add form keeps suggesting an item that has just been
    // removed, and misses one just added.
    queryClient.invalidateQueries({ queryKey: ['item-names'] }),
    queryClient.invalidateQueries({ queryKey: ['items-removed'] }),
    queryClient.invalidateQueries({ queryKey: ['item-audit'] }),
    queryClient.invalidateQueries({ queryKey: ['stock'] }),
    queryClient.invalidateQueries({ queryKey: ['storefront-catalog'] }),
    queryClient.invalidateQueries({ queryKey: ['dashboard-needs-attention'] }),
    ])
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

/** Uploads a new profile photo — replaces the previous one in place. */
export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.upload<{ avatarUrl: string }>('/storefront/me/avatar', formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
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
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stock'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] }),
        queryClient.invalidateQueries({ queryKey: ['item-removal-check'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-items'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-needs-attention'] }),
      ])
    },
  })
}

/**
 * Records a batch: what it consumed and what it yielded. One call moves the
 * ledger in both directions, so everything that reads stock has to refresh.
 */
/**
 * Marks a customer new or regular. Nothing derives this — who counts as a
 * regular is the shop's judgement, and a discount hangs off the answer.
 */
export function useSetCustomerSegment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, segment }: { id: string; segment: CustomerSegment }) =>
      api.patch(`/customers/${id}/segment`, { segment }),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['customer-counts'] }),
      ]),
  })
}

export function useRecordProduction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ProductionRunInput) => api.post('/production', input),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['production'] }),
        queryClient.invalidateQueries({ queryKey: ['stock'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-movements'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['inventory-items'] }),
        queryClient.invalidateQueries({ queryKey: ['item-removal-check'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard-needs-attention'] }),
      ]),
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

/**
 * Records a running cost against a month. Both the month's profit figures and
 * the list of months that have anything in them change as a result, so both
 * are refetched.
 */
export function useAddMonthlyExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { month: string; description: string; amount: number }) =>
      api.post('/revenue/expenses', input),
    onSuccess: (_data, input) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-profit', input.month] })
      queryClient.invalidateQueries({ queryKey: ['profit-months'] })
    },
  })
}

export function useDeleteMonthlyExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }: { id: string; month: string }) =>
      api.delete(`/revenue/expenses/${id}`),
    onSuccess: (_data, { month }) => {
      queryClient.invalidateQueries({ queryKey: ['monthly-profit', month] })
    },
  })
}
