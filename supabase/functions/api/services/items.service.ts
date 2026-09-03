import * as itemsRepo from '../repositories/items.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { ItemCategory, ItemInput } from '../types/domain.ts'

const CATEGORIES: ItemCategory[] = ['raw_material', 'b2b', 'manufacturing']

export const ItemsService = {
  /** Creates or updates any item, whichever category the admin chose. */
  save: (input: ItemInput) => {
    if (!CATEGORIES.includes(input.category)) {
      throw new HttpError(400, `Unknown category: ${input.category}`)
    }
    if (!input.name?.trim()) {
      throw new HttpError(400, 'Name is required')
    }
    if (!input.stockUnit?.trim()) {
      throw new HttpError(400, 'Stock unit is required')
    }
    // Anything that sells has to say what it sells in, and how that converts
    // back to stock — otherwise despatch cannot know what to deduct.
    if (input.category !== 'raw_material') {
      if (!input.salesUnit?.trim()) {
        throw new HttpError(400, 'Sales unit is required for anything sold')
      }
      if (!Number.isFinite(input.salesToStockFactor) || input.salesToStockFactor <= 0) {
        throw new HttpError(400, 'Conversion must be greater than zero')
      }
    }
    if (!Number.isFinite(input.lowStockThreshold) || input.lowStockThreshold < 0) {
      throw new HttpError(400, 'Low-stock alert cannot be negative')
    }

    if (input.category === 'manufacturing') {
      if (!Number.isFinite(input.batchCapacity) || input.batchCapacity <= 0) {
        throw new HttpError(400, 'Batch capacity must be greater than zero')
      }
      if (input.discountPercent < 0 || input.discountPercent > 100) {
        throw new HttpError(400, 'Discount must be between 0 and 100')
      }
      // Without a price on at least one size the product cannot be sold, and
      // the storefront would list it with nothing to charge.
      if (!input.packSizes.some((pack) => pack.price > 0)) {
        throw new HttpError(400, 'Set a price on at least one pack size')
      }
    }

    return itemsRepo.save(input)
  },

  remove: (id: string) => itemsRepo.softDelete(id),
}
