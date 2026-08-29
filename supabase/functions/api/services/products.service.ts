import * as productsRepo from '../repositories/products.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { Product } from '../types/domain.ts'

function generateProductId(): string {
  return `p-${crypto.randomUUID().replace(/-/g, '').slice(0, 10)}`
}

export const ProductsService = {
  list: () => productsRepo.listActive(),

  save: (product: Product) => {
    if (!product.name) {
      throw new HttpError(400, 'Product name is required')
    }
    // ID generation is a backend decision — the frontend never invents one.
    const withId: Product = { ...product, id: product.id || generateProductId() }
    return productsRepo.upsert(withId)
  },

  remove: (id: string) => productsRepo.softDelete(id),
}
