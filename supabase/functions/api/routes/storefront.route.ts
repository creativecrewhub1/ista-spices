import { Hono } from 'npm:hono@4'
import { StorefrontService } from '../services/storefront.service.ts'
import type { CheckoutInput } from '../types/domain.ts'
import type { AppEnv } from '../types/context.ts'

export const storefrontRoute = new Hono<AppEnv>()

// Public — no session required — this is what customers browse before login.
storefrontRoute.get('/products', async (c) => {
  const products = await StorefrontService.listCatalog()
  return c.json(products)
})

// requireAuth only (see index.ts) — any signed-in user, admin or customer,
// can place and read their own orders. Not admin-gated: this is a
// customer's own cart, not business management.
storefrontRoute.post('/orders', async (c) => {
  const userId = c.get('userId')
  const userEmail = c.get('userEmail')
  const body = await c.req.json<CheckoutInput>()
  const result = await StorefrontService.checkout(userId, userEmail, body)
  return c.json(result, 201)
})

storefrontRoute.get('/orders', async (c) => {
  const userId = c.get('userId')
  const orders = await StorefrontService.myOrders(userId)
  return c.json(orders)
})
