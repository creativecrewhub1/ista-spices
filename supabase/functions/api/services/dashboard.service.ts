import * as productsRepo from '../repositories/products.repo.ts'
import * as ordersRepo from '../repositories/orders.repo.ts'
import type { AttentionItem, NeedsAttentionResponse, Order, TodaySummary } from '../types/domain.ts'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export const DashboardService = {
  async today(): Promise<TodaySummary> {
    const orders = await ordersRepo.list()
    const today = todayIso()
    const todaysOrders = orders.filter((o) => o.placedAt.startsWith(today))
    const activeToday = todaysOrders.filter((o) => o.status !== 'cancelled')

    const statusCounts = {
      pending: todaysOrders.filter((o) => o.status === 'pending').length,
      processing: todaysOrders.filter((o) => o.status === 'processing').length,
      packed: todaysOrders.filter((o) => o.status === 'packed').length,
      delivered: todaysOrders.filter((o) => o.status === 'delivered').length,
    }

    const avgOrderValue = activeToday.length
      ? activeToday.reduce((sum, o) => sum + o.total, 0) / activeToday.length
      : 0

    return {
      totalOrders: todaysOrders.length,
      statusCounts,
      pendingCount: statusCounts.pending,
      avgOrderValue,
    }
  },

  async needsAttention(): Promise<NeedsAttentionResponse> {
    const [products, orders] = await Promise.all([productsRepo.listActive(), ordersRepo.list()])
    const now = Date.now()

    const lowStock: AttentionItem[] = products
      .filter((p) => p.stockLevel === 'low')
      .map((p) => ({
        id: `stock-${p.id}`,
        kind: 'low-stock' as const,
        linkTo: '/inventory' as const,
        productName: p.name,
        unitsInHand: p.unitsPackedThisBatch,
        batchCapacity: p.batchCapacity,
      }))

    const lateOrders: AttentionItem[] = orders
      .filter((o: Order) => o.status !== 'delivered' && o.status !== 'cancelled')
      .filter((o: Order) => new Date(o.eta).getTime() < now)
      .map((o: Order) => ({
        id: `order-${o.id}`,
        kind: 'late-order' as const,
        linkTo: '/orders' as const,
        orderId: o.id,
        customerName: o.customerName,
        eta: o.eta,
      }))

    return { items: [...lateOrders, ...lowStock] }
  },
}
