import * as productionRepo from '../repositories/production.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { ProductionRunInput } from '../types/domain.ts'

export const ProductionService = {
  list: (limit?: number) => productionRepo.list(limit),

  /**
   * Records what a batch consumed and what it yielded. The database refuses
   * a run with no inputs or one that overdraws stock; these checks are here
   * so the admin gets a sentence instead of a constraint error.
   */
  record: async (input: ProductionRunInput, userId: string | null) => {
    if (!input.productId) throw new HttpError(400, 'Choose what was produced')
    if (!Number.isFinite(input.outputQty) || input.outputQty <= 0) {
      throw new HttpError(400, 'Output quantity must be greater than zero')
    }
    if (!input.inputs?.length) {
      throw new HttpError(400, 'Tick at least one material that went into this batch')
    }
    for (const line of input.inputs) {
      if (!line.itemId) throw new HttpError(400, 'A ticked material is missing its item')
      if (!Number.isFinite(line.qty) || line.qty <= 0) {
        throw new HttpError(400, 'Every ticked material needs a quantity greater than zero')
      }
    }
    // The same item twice would collide on the run's uniqueness rule, and the
    // second figure would silently be the only one recorded.
    if (new Set(input.inputs.map((line) => line.itemId)).size !== input.inputs.length) {
      throw new HttpError(400, 'The same material is listed twice')
    }
    // Nothing is made out of itself.
    if (input.inputs.some((line) => line.itemId === input.productId)) {
      throw new HttpError(400, 'A product cannot be an input to itself')
    }

    // The trigger refuses an overdraw too, but only as a database error. A
    // person needs to know which material is short and by how much.
    const stock = await productionRepo.stockFor(input.inputs.map((line) => line.itemId))
    for (const line of input.inputs) {
      const held = stock.get(line.itemId)
      if (!held) {
        throw new HttpError(400, `${line.itemId} is not an item that can be consumed`)
      }
      if (line.qty > held.onHand) {
        throw new HttpError(
          409,
          `Only ${held.onHand} ${held.unit} of ${held.name} in stock — this batch needs ${line.qty}.`,
        )
      }
    }

    return productionRepo.record(input, userId)
  },
}
