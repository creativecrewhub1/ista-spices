import { Hono } from 'npm:hono@4'
import { ItemsService } from '../services/items.service.ts'
import type { ItemInput } from '../types/domain.ts'

/**
 * The single write path for stock items. Raw materials, B2B goods and
 * manufactured products differ by category on the way in, not by endpoint —
 * so there is one place where an item is created, whatever it is.
 */
export const itemsRoute = new Hono()

itemsRoute.post('/', async (c) => {
  const body = await c.req.json<ItemInput>()
  const id = await ItemsService.save(body)
  return c.json({ ok: true, id })
})

itemsRoute.delete('/:id', async (c) => {
  await ItemsService.remove(c.req.param('id'))
  return c.json({ ok: true })
})
