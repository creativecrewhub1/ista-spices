import * as productsRepo from '../repositories/products.repo.ts'
import * as ordersRepo from '../repositories/orders.repo.ts'
import * as customersRepo from '../repositories/customers.repo.ts'
import * as authRepo from '../repositories/auth.repo.ts'
import { HttpError } from '../lib/httpError.ts'
import type { CheckoutInput, UpdateProfileInput } from '../types/domain.ts'

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

    // Collapse repeats of the same product+pack into one line: the order
    // table holds one row per (order, product, pack quantity).
    const mergedQty = new Map<string, { productId: string; packQty: number; qty: number }>()
    for (const item of input.items) {
      const key = `${item.productId}|${item.packQty}`
      const existing = mergedQty.get(key)
      if (existing) existing.qty += item.qty
      else mergedQty.set(key, { productId: item.productId, packQty: item.packQty, qty: item.qty })
    }

    const productIds = [...new Set(input.items.map((item) => item.productId))]
    const packs = await ordersRepo.getPackPrices(productIds)

    const lineItems = [...mergedQty.values()].map((item) => {
      const pack = packs.find((p) => p.product_id === item.productId && p.pack_qty === item.packQty)
      if (!pack) {
        throw new HttpError(400, `${item.productId} is not sold in packs of ${item.packQty}`)
      }
      // Price and unit both come from the catalogue, never from the client,
      // and are copied onto the line so the order stops depending on it.
      return {
        productId: item.productId,
        packQty: item.packQty,
        packUnit: pack.pack_unit,
        qty: item.qty,
        price: pack.price,
      }
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

  myProfile: (userId: string) => customersRepo.findFullByUserId(userId),

  updateMyProfile: (userId: string, input: UpdateProfileInput) => {
    if (input.name !== undefined && !input.name.trim()) {
      throw new HttpError(400, 'Name cannot be empty')
    }
    if (input.phone !== undefined && !input.phone.trim()) {
      throw new HttpError(400, 'Phone cannot be empty')
    }
    if (input.address !== undefined && !input.address.trim()) {
      throw new HttpError(400, 'Address cannot be empty')
    }
    return customersRepo.updateForUser(userId, input)
  },

  /** Everything this account holds, for a self-service data export. */
  exportMyData: async (userId: string) => {
    const [profile, orders] = await Promise.all([
      customersRepo.findFullByUserId(userId),
      StorefrontService.myOrders(userId),
    ])
    return { profile, orders, exportedAt: new Date().toISOString() }
  },

  /**
   * Self-service account deletion. Personal data is scrubbed rather than
   * the row deleted outright — past orders stay attached to a real
   * business record. The order matters: the customer row's user_id must be
   * cleared before the auth user can be deleted, since that FK has no
   * cascade.
   */
  deleteMyAccount: async (userId: string) => {
    await customersRepo.anonymizeForUser(userId)
    await authRepo.deleteAuthUser(userId)
  },

  uploadAvatar: async (userId: string, file: File | null) => {
    if (!file) throw new HttpError(400, 'No photo was uploaded')
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new HttpError(400, 'Photo must be a JPEG, PNG, WebP, or GIF image')
    }
    const MAX_BYTES = 3 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      throw new HttpError(400, 'Photo must be under 3MB')
    }
    const avatarUrl = await customersRepo.uploadAvatar(userId, file)
    return { avatarUrl }
  },
}
