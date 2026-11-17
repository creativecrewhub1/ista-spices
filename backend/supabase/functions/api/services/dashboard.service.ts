import * as productsRepo from '../repositories/products.repo.ts'
import * as ordersRepo from '../repositories/orders.repo.ts'
import * as dashboardRepo from '../repositories/dashboard.repo.ts'
import type {
  AttentionItem,
  DashboardKpis,
  NeedsAttentionResponse,
  Order,
  TodaySummary,
} from '../types/domain.ts'

export const DashboardService = {
  /** Headline figures, aggregated by Postgres — see the dashboard_kpis view. */
  kpis: (): Promise<DashboardKpis> => dashboardRepo.getKpis(),

  today: (): Promise<TodaySummary> => dashboardRepo.getToday(),

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
        stockUnit: p.stockUnit,
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
