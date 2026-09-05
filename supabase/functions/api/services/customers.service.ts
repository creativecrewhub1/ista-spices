import * as customersRepo from '../repositories/customers.repo.ts'
import * as ordersRepo from '../repositories/orders.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { CustomerFilters } from '../repositories/customers.repo.ts'

const SEGMENTS = new Set(['new', 'regular'])

export const CustomersService = {
  list: (filters: CustomerFilters = {}) => {
    if (filters.segment && !SEGMENTS.has(filters.segment)) {
      throw new HttpError(400, `Unknown segment: ${filters.segment}`)
    }
    return customersRepo.listWithStats(filters)
  },

  counts: () => customersRepo.counts(),

  /** A customer's orders, resolved by foreign key rather than by matching names. */
  orders: (customerId: string) => ordersRepo.listForCustomer(customerId),
}
