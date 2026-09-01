import type { ProductCategory } from '../data/types'

export interface ShopFilters {
  categories: ProductCategory[]
  spiceLevels: string[]
  maxPrice: number
  inStockOnly: boolean
}

export const DEFAULT_MAX_PRICE = 1600

export const defaultFilters: ShopFilters = {
  categories: [],
  spiceLevels: [],
  maxPrice: DEFAULT_MAX_PRICE,
  inStockOnly: false,
}
