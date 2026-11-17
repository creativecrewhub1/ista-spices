import * as stockRepo from '../repositories/stock.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { StockReceiptInput } from '../types/domain.ts'

export const StockService = {
  list: () => stockRepo.listStock(),

  movements: (itemId?: string, limit?: number) => stockRepo.listMovements(itemId, limit),

  /** Stock in. Validated here so a bad figure never reaches the ledger. */
  receive: async (input: StockReceiptInput) => {
    if (!input.itemId) throw new HttpError(400, 'An item is required')
    if (!Number.isFinite(input.qty) || input.qty <= 0) {
      throw new HttpError(400, 'Quantity must be greater than zero')
    }
    if (!Number.isFinite(input.totalCost) || input.totalCost < 0) {
      throw new HttpError(400, 'Total cost cannot be negative')
    }

    const item = await stockRepo.kindOf(input.itemId)
    if (!item) throw new HttpError(404, 'No such item')

    // Only bought things are bought in. A manufactured good gets its stock
    // from a production run, which draws the materials and costs the batch;
    // receiving one directly would put stock on the shelf with nothing taken
    // off to make it, and a purchase price where a batch cost belongs.
    if (item.origin === 'manufactured') {
      throw new HttpError(
        400,
        `${item.name} is made, not bought. Record a production run instead.`,
      )
    }

    return stockRepo.recordReceipt(input)
  },

  adjust: (input: { itemId: string; qty: number; note: string }) => {
    if (!input.itemId) throw new HttpError(400, 'An item is required')
    if (!Number.isFinite(input.qty) || input.qty === 0) {
      throw new HttpError(400, 'Adjustment cannot be zero')
    }
    // An unexplained adjustment is indistinguishable from a mistake later.
    if (!input.note?.trim()) throw new HttpError(400, 'A reason is required')
    return stockRepo.recordAdjustment(input)
  },
}
