import * as ordersRepo from '../repositories/orders.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { Order, OrderListFilters, OrderStatus } from '../types/domain.ts'

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
]

export const OrdersService = {
  list: async (filters: { status?: string; search?: string } = {}): Promise<Order[]> => {
    if (filters.status && !VALID_STATUSES.includes(filters.status as OrderStatus)) {
      throw new HttpError(400, `Invalid order status: ${filters.status}`)
    }
    const repoFilters: OrderListFilters = {
      status: filters.status as OrderStatus | undefined,
      search: filters.search,
    }

    const search = filters.search?.trim()
    if (!search) return ordersRepo.list(repoFilters)

    // A search term can match either the order id or the customer name;
    // union both so neither loses its index.
    const [byId, byCustomer] = await Promise.all([
      ordersRepo.list(repoFilters),
      ordersRepo.listByCustomerName(search, repoFilters.status),
    ])

    const merged = new Map<string, Order>()
    for (const order of [...byId, ...byCustomer]) merged.set(order.id, order)
    return [...merged.values()].sort((a, b) => b.placedAt.localeCompare(a.placedAt))
  },

  statusCounts: () => ordersRepo.getStatusCounts(),

  updateStatus: (orderId: string, status: string) => {
    if (!VALID_STATUSES.includes(status as OrderStatus)) {
      throw new HttpError(400, `Invalid order status: ${status}`)
    }
    return ordersRepo.updateStatus(orderId, status as OrderStatus)
  },
}
