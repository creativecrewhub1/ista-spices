import { Hono } from 'npm:hono@4'
import { StorefrontService } from '../services/storefront.service.ts'
import { HttpError } from '../lib/httpError.ts'
import type { CheckoutInput, UpdateProfileInput } from '../types/domain.ts'
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

storefrontRoute.get('/me', async (c) => {
  const profile = await StorefrontService.myProfile(c.get('userId'))
  return c.json(profile)
})

storefrontRoute.put('/me', async (c) => {
  const body = await c.req.json<UpdateProfileInput>()
  await StorefrontService.updateMyProfile(c.get('userId'), body)
  return c.json({ ok: true })
})

/** A self-service data export — everything this account holds, as one JSON download. */
storefrontRoute.get('/me/export', async (c) => {
  const data = await StorefrontService.exportMyData(c.get('userId'))
  return c.json(data)
})

/** Self-service account deletion. The admin account can't delete itself here. */
storefrontRoute.delete('/me', async (c) => {
  if (c.get('userRole') === 'admin') {
    throw new HttpError(403, 'The admin account cannot be deleted here')
  }
  await StorefrontService.deleteMyAccount(c.get('userId'))
  return c.json({ ok: true })
})
