import * as ordersRepo from '../repositories/orders.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { OrderStatus } from '../types/domain.ts'

const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'packed',
  'shipped',
  'delivered',
  'cancelled',
]

export const OrdersService = {
  list: () => ordersRepo.list(),

  updateStatus: (orderId: string, status: string) => {
    if (!VALID_STATUSES.includes(status as OrderStatus)) {
      throw new HttpError(400, `Invalid order status: ${status}`)
    }
    return ordersRepo.updateStatus(orderId, status as OrderStatus)
  },
}
