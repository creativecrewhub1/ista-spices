import * as inventoryItemsRepo from '../repositories/inventoryItems.repo.ts'

export const InventoryItemsService = {
  list: (filters: { type?: string; search?: string } = {}) => inventoryItemsRepo.listActive(filters),
}
