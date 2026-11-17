import { Hono } from 'npm:hono@4'
import { ItemsService } from '../services/items.service.ts'
import type { ItemInput } from '../types/domain.ts'
import type { AppEnv } from '../types/context.ts'

/**
 * The single write path for stock items. Raw materials, B2B goods and
 * manufactured products differ by category on the way in, not by endpoint —
 * so there is one place where an item is created, whatever it is.
 */
export const itemsRoute = new Hono<AppEnv>()

// Ahead of '/:id', which would otherwise swallow them.
itemsRoute.get('/names', async (c) => {
  return c.json(await ItemsService.names())
})

itemsRoute.get('/:id/audit', async (c) => {
  return c.json(await ItemsService.audit(c.req.param('id')))
})

itemsRoute.get('/:id/removal-check', async (c) => {
  return c.json(await ItemsService.removalCheck(c.req.param('id')))
})

itemsRoute.get('/removed', async (c) => {
  return c.json(await ItemsService.removed())
})

itemsRoute.post('/:id/restore', async (c) => {
  await ItemsService.restore(c.req.param('id'), c.get('userId') ?? null)
  return c.json({ ok: true })
})

itemsRoute.get('/:id', async (c) => {
  const item = await ItemsService.get(c.req.param('id'))
  return c.json(item)
})

itemsRoute.post('/', async (c) => {
  const body = await c.req.json<ItemInput>()
  const id = await ItemsService.save(body, c.get('userId') ?? null)
  return c.json({ ok: true, id })
})

itemsRoute.delete('/:id', async (c) => {
  // Recorded against whoever is signed in, from requireAuth.
  await ItemsService.remove(c.req.param('id'), c.get('userId') ?? null)
  return c.json({ ok: true })
})
