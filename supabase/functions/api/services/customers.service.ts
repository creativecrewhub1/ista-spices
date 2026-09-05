import * as customersRepo from '../repositories/customers.repo.ts'
import * as ordersRepo from '../repositories/orders.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { CustomerFilters } from '../repositories/customers.repo.ts'
import type { CustomerSegment } from '../types/domain.ts'

const SEGMENTS = new Set(['new', 'regular'])

export const CustomersService = {
  list: (filters: CustomerFilters = {}) => {
    if (filters.segment && !SEGMENTS.has(filters.segment)) {
      throw new HttpError(400, `Unknown segment: ${filters.segment}`)
    }
    return customersRepo.listWithStats(filters)
  },

  counts: () => customersRepo.counts(),

  /** Marks a customer new or regular. Regular is what a discount hangs off. */
  setSegment: async (id: string, segment: string) => {
    if (!id) throw new HttpError(400, 'A customer is required')
    if (!SEGMENTS.has(segment)) {
      throw new HttpError(400, `Unknown segment: ${segment}`)
    }
    const exists = await customersRepo.findById(id)
    if (!exists) throw new HttpError(404, `Customer ${id} not found`)
    await customersRepo.setSegment(id, segment as CustomerSegment)
  },

  /** A customer's orders, resolved by foreign key rather than by matching names. */
  orders: (customerId: string) => ordersRepo.listForCustomer(customerId),
}
