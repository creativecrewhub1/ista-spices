import * as productionRepo from '../repositories/production.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { ProductionCosting, ProductionInputLine, StockLayer } from '../types/domain.ts'

/**
 * Works out what a batch will cost before it is recorded, drawing each
 * material oldest batch first.
 *
 * This is the same rule the database applies when the run is posted, so what
 * the admin is shown here is what will actually be written. It is kept here,
 * rather than asked of the database, because it is a question — "what would
 * this cost" — and answering it must not move any stock.
 */
export function allocateFifo(
  lines: ProductionInputLine[],
  layersByItem: Map<string, StockLayer[]>,
  namesByItem: Map<string, { name: string; unit: string }>,
): ProductionCosting['materials'] {
  return lines.map((line) => {
    const item = namesByItem.get(line.itemId)
    if (!item) throw new HttpError(400, `${line.itemId} is not an item that can be consumed`)

    // Oldest first. Layers arrive already ordered by the repository.
    const layers = layersByItem.get(line.itemId) ?? []
    const drawn: ProductionCosting['materials'][number]['drawnFrom'] = []
    let stillNeeded = line.qty

    for (const layer of layers) {
      if (stillNeeded <= 0) break
      const taken = Math.min(stillNeeded, layer.remainingQty)
      if (taken <= 0) continue
      drawn.push({
        batchNo: layer.batchNo,
        arrivedAt: layer.occurredAt,
        qty: taken,
        unitCost: layer.unitCost,
        // A layer with no known cost — an opening balance — contributes stock
        // but nothing to the bill. Inventing a rate for it would be worse.
        lineCost: taken * (layer.unitCost ?? 0),
      })
      stillNeeded -= taken
    }

    return {
      itemId: line.itemId,
      itemName: item.name,
      unit: item.unit,
      qty: line.qty,
      // What the layers could not cover. Stock exists that predates any
      // costed consignment, and saying so is better than hiding it.
      uncovered: stillNeeded > 0 ? Number(stillNeeded.toFixed(3)) : 0,
      drawnFrom: drawn,
      materialCost: drawn.reduce((sum, d) => sum + d.lineCost, 0),
    }
  })
}

export const CostingService = {
  /** What a batch would cost, batch by batch, without recording anything. */
  preview: async (
    lines: ProductionInputLine[],
    outputQty: number,
  ): Promise<ProductionCosting> => {
    if (!lines?.length) throw new HttpError(400, 'Nothing has been selected to cost')

    const itemIds = [...new Set(lines.map((line) => line.itemId))]
    const [layersByItem, namesByItem] = await Promise.all([
      productionRepo.layersFor(itemIds),
      productionRepo.namesFor(itemIds),
    ])

    const materials = allocateFifo(lines, layersByItem, namesByItem)
    const totalCost = materials.reduce((sum, material) => sum + material.materialCost, 0)

    return {
      materials,
      totalCost,
      outputQty,
      // The number the whole exercise is for: what one unit of the finished
      // good cost to make.
      costPerOutputUnit: outputQty > 0 ? totalCost / outputQty : null,
    }
  },
}
