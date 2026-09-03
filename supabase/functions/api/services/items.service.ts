import * as itemsRepo from '../repositories/items.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { ItemCategory, ItemInput } from '../types/domain.ts'

const CATEGORIES: ItemCategory[] = ['raw_material', 'b2b', 'manufacturing']
const SHOP_CATEGORIES = ['spice-powder', 'cooking-oil']

export const ItemsService = {
  /** Names on file, so the form can suggest and warn as one is typed. */
  names: () => itemsRepo.listNames(),

  /** The edit form loads from here, so every writable field is returned. */
  get: async (id: string) => {
    const item = await itemsRepo.findById(id)
    if (!item) throw new HttpError(404, `Item ${id} not found`)
    return item
  },

  /** Creates or updates any item, whichever category the admin chose. */
  save: async (input: ItemInput) => {
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
      if (!SHOP_CATEGORIES.includes(input.productCategory)) {
        throw new HttpError(400, 'Choose a shop category')
      }
      if (!Number.isFinite(input.batchCapacity) || input.batchCapacity <= 0) {
        throw new HttpError(400, 'Batch capacity must be greater than zero')
      }
      if (input.discountPercent < 0 || input.discountPercent > 100) {
        throw new HttpError(400, 'Discount must be between 0 and 100')
      }
      // Without a priced pack the product cannot be sold, and the storefront
      // would list it with nothing to charge.
      if (input.packSizes.length === 0) {
        throw new HttpError(400, 'Add at least one pack size')
      }
      for (const pack of input.packSizes) {
        if (!Number.isFinite(pack.qty) || pack.qty <= 0) {
          throw new HttpError(400, 'Every pack size needs a quantity greater than zero')
        }
        if (!Number.isFinite(pack.price) || pack.price <= 0) {
          throw new HttpError(400, 'Every pack size needs a price greater than zero')
        }
      }
      // Two rows with the same quantity would collide on the catalogue's
      // uniqueness rule, and a shopper could not tell them apart anyway.
      if (new Set(input.packSizes.map((pack) => pack.qty)).size !== input.packSizes.length) {
        throw new HttpError(400, 'Pack sizes must each have a different quantity')
      }
    }

    // A unique index refuses a clash anyway, but only with a constraint
    // error. Naming the item that already holds the name is the difference
    // between a dead end and something the admin can act on.
    const normalised = itemsRepo.normaliseName(input.name)
    const clash = (await itemsRepo.listNames()).find(
      (existing) =>
        existing.id !== input.id && itemsRepo.normaliseName(existing.name) === normalised,
    )
    if (clash) {
      throw new HttpError(
        409,
        `"${clash.name}" already exists. Edit that item instead of adding it twice.`,
      )
    }

    return itemsRepo.save(input)
  },

  remove: (id: string) => itemsRepo.softDelete(id),
}
