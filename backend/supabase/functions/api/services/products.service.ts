import * as productsRepo from '../repositories/products.repo.ts'

export const ProductsService = {
  list: (search?: string) => productsRepo.listActive(search?.trim() || undefined),
}
