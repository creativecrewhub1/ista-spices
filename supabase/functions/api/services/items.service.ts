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

  /** Everything that has happened to an item, newest first. */
  audit: async (id: string) => {
    const state = await itemsRepo.findState(id)
    if (!state) throw new HttpError(404, `Item ${id} not found`)
    return itemsRepo.listAudit(id)
  },

  /** Creates or updates any item, whichever category the admin chose. */
  save: async (input: ItemInput, userId: string | null) => {
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
    }
    // Whatever is sold has to say how a sale draws on stock, raw materials
    // included once they are for sale.
    if (input.salesUnit?.trim()) {
      if (!Number.isFinite(input.salesToStockFactor) || input.salesToStockFactor <= 0) {
        throw new HttpError(400, 'Conversion must be greater than zero')
      }
    }
    if (!Number.isFinite(input.lowStockThreshold) || input.lowStockThreshold < 0) {
      throw new HttpError(400, 'Low-stock alert cannot be negative')
    }

    // A raw material is for sale only once a selling unit is chosen for it.
    const isSellable = input.category !== 'raw_material' || Boolean(input.salesUnit?.trim())

    // Anything sold needs a price, whether the shop made it, bought it in, or
    // sells the raw material as it stands. Without one the storefront would
    // list it with nothing to charge.
    if (isSellable) {
      if (input.packSizes.length === 0) {
        throw new HttpError(400, 'Add at least one selling price')
      }
      for (const pack of input.packSizes) {
        if (!Number.isFinite(pack.qty) || pack.qty <= 0) {
          throw new HttpError(400, 'Every selling price needs a quantity greater than zero')
        }
        if (!Number.isFinite(pack.price) || pack.price <= 0) {
          throw new HttpError(400, 'Every selling price needs an amount greater than zero')
        }
      }
      // Two rows with the same quantity would collide on the catalogue's
      // uniqueness rule, and a shopper could not tell them apart anyway.
      if (new Set(input.packSizes.map((pack) => pack.qty)).size !== input.packSizes.length) {
        throw new HttpError(400, 'Each selling price must be for a different quantity')
      }
    }

    // Shop classification, batch size and discounting only describe something
    // the shop makes; a resold good has none of them.
    if (input.category === 'manufacturing') {
      if (!SHOP_CATEGORIES.includes(input.productCategory)) {
        throw new HttpError(400, 'Choose a shop category')
      }
      if (input.discountPercent < 0 || input.discountPercent > 100) {
        throw new HttpError(400, 'Discount must be between 0 and 100')
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

    return itemsRepo.save(input, userId)
  },

  /**
   * What is keeping an item in the catalogue, if anything. The dialog reads
   * this so it can refuse before the admin commits to it.
   */
  removalCheck: async (id: string) => {
    const state = await itemsRepo.findState(id)
    if (!state) throw new HttpError(404, `Item ${id} not found`)
    const [quantityOnHand, openOrders] = await Promise.all([
      itemsRepo.quantityOnHand(id),
      itemsRepo.openOrderLines(id),
    ])
    return {
      canRemove: quantityOnHand === 0 && openOrders === 0,
      quantityOnHand,
      stockUnit: state.stockUnit,
      openOrders,
    }
  },

  /** Items out of the catalogue, and what still depends on them. */
  removed: () => itemsRepo.listRemoved(),

  /**
   * Takes an item out of the catalogue without deleting it. Order lines,
   * stock movements and revenue all still point at the row.
   */
  remove: async (id: string, userId: string | null) => {
    const state = await itemsRepo.findState(id)
    if (!state) throw new HttpError(404, `Item ${id} not found`)
    if (!state.isActive) throw new HttpError(409, `"${state.name}" has already been removed`)

    // Stock on hand has to be accounted for before an item leaves the
    // catalogue. Removing it would take the balance off the Stock screen
    // while the movements stayed in the ledger, so the two would disagree
    // about what the shop owns.
    const onHand = await itemsRepo.quantityOnHand(id)
    if (onHand !== 0) {
      throw new HttpError(
        409,
        `"${state.name}" still holds ${onHand} ${state.stockUnit} in stock. Clear it first — sell it, consume it, or write it off in Stock — then remove the item.`,
      )
    }

    // An order the shop has not finished with is a promise to a customer.
    // Delivered and cancelled lines are history and deliberately do not
    // count: they would keep a product in the catalogue for ever.
    const openOrders = await itemsRepo.openOrderLines(id)
    if (openOrders !== 0) {
      throw new HttpError(
        409,
        `"${state.name}" is on ${openOrders} order ${openOrders === 1 ? 'line' : 'lines'} that ${openOrders === 1 ? 'is' : 'are'} not delivered yet. Finish or cancel ${openOrders === 1 ? 'it' : 'them'} before removing the item.`,
      )
    }

    await itemsRepo.softDelete(id, userId)
  },

  /** Puts one back. */
  restore: async (id: string, userId: string | null) => {
    const state = await itemsRepo.findState(id)
    if (!state) throw new HttpError(404, `Item ${id} not found`)
    if (state.isActive) throw new HttpError(409, `"${state.name}" is already in the catalogue`)

    // A removed item's name is free for something else to take, because the
    // uniqueness rule only covers live items. If that happened, restoring
    // would break it, so say so rather than let the index refuse.
    const normalised = itemsRepo.normaliseName(state.name)
    const taken = (await itemsRepo.listNames()).find(
      (existing) => itemsRepo.normaliseName(existing.name) === normalised,
    )
    if (taken) {
      throw new HttpError(
        409,
        `"${taken.name}" is in the catalogue again, so this one cannot come back under the same name. Rename that item first.`,
      )
    }

    await itemsRepo.restore(id, userId)
  },
}
