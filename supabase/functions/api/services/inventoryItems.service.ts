import * as inventoryItemsRepo from '../repositories/inventoryItems.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { InventoryItem } from '../types/domain.ts'

function generateInventoryItemId(type: InventoryItem['type']): string {
  const prefix = type === 'raw_material' ? 'rm' : 'b2b'
  return `${prefix}-${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`
}

export const InventoryItemsService = {
  list: () => inventoryItemsRepo.listActive(),

  save: (item: InventoryItem) => {
    if (!item.name) {
      throw new HttpError(400, 'Item name is required')
    }
    if (!item.unit) {
      throw new HttpError(400, 'Unit is required')
    }
    // ID generation is a backend decision — the frontend never invents one.
    const withId: InventoryItem = { ...item, id: item.id || generateInventoryItemId(item.type) }
    return inventoryItemsRepo.upsert(withId)
  },

  remove: (id: string) => inventoryItemsRepo.softDelete(id),
}
