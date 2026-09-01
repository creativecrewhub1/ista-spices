import * as productsRepo from '../repositories/products.repo.ts'
import * as ordersRepo from '../repositories/orders.repo.ts'
import * as customersRepo from '../repositories/customers.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { CheckoutInput, PackSizeLabel } from '../types/domain.ts'

export const StorefrontService = {
  listCatalog: () => productsRepo.listPublicCatalog(),

  checkout: async (userId: string, userEmail: string, input: CheckoutInput) => {
    if (!input.items?.length) throw new HttpError(400, 'Cart is empty')
    if (!input.address?.trim()) throw new HttpError(400, 'Delivery address is required')
    for (const item of input.items) {
      if (!item.qty || item.qty <= 0) throw new HttpError(400, 'Quantity must be at least 1')
    }

    let customer = await customersRepo.findByUserId(userId)
    if (!customer) {
      if (!input.name?.trim() || !input.phone?.trim()) {
        throw new HttpError(400, 'Name and phone are required for your first order')
      }
      const customerId = await customersRepo.createForUser(userId, {
        name: input.name,
        phone: input.phone,
        address: input.address,
        email: userEmail || undefined,
      })
      customer = { id: customerId }
    }

    // Collapse repeats of the same product+size into one line: the order
    // table holds one row per (order, product, pack size).
    const mergedQty = new Map<string, { productId: string; packSize: PackSizeLabel; qty: number }>()
    for (const item of input.items) {
      const key = `${item.productId}|${item.packSize}`
      const existing = mergedQty.get(key)
      if (existing) existing.qty += item.qty
      else mergedQty.set(key, { productId: item.productId, packSize: item.packSize, qty: item.qty })
    }

    const productIds = [...new Set(input.items.map((item) => item.productId))]
    const prices = await ordersRepo.getPackPrices(productIds)
    const priceFor = (productId: string, size: string) =>
      prices.find((p) => p.product_id === productId && p.size === size)?.price

    const lineItems = [...mergedQty.values()].map((item) => {
      const price = priceFor(item.productId, item.packSize)
      if (price === undefined) {
        throw new HttpError(400, `${item.productId} is not available in size ${item.packSize}`)
      }
      return { productId: item.productId, packSize: item.packSize, qty: item.qty, price }
    })

    const orderId = `o-${crypto.randomUUID().slice(0, 10)}`
    await ordersRepo.insertOrder({ id: orderId, customerId: customer.id, address: input.address })
    await ordersRepo.insertOrderItems(orderId, lineItems)

    return { orderId }
  },

  myOrders: async (userId: string) => {
    const customer = await customersRepo.findByUserId(userId)
    if (!customer) return []
    return ordersRepo.listForCustomer(customer.id)
  },
}
