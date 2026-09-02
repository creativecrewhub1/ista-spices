import { Hono } from 'npm:hono@4'
import { InventoryItemsService } from '../services/inventoryItems.service.ts'
import type { InventoryItem } from '../types/domain.ts'

export const inventoryItemsRoute = new Hono()

inventoryItemsRoute.get('/', async (c) => {
  const items = await InventoryItemsService.list({ type: c.req.query('type'), search: c.req.query('q')?.trim() || undefined })
  return c.json(items)
})

inventoryItemsRoute.post('/', async (c) => {
  const body = await c.req.json<InventoryItem>()
  await InventoryItemsService.save(body)
  return c.json({ ok: true })
})

inventoryItemsRoute.delete('/:id', async (c) => {
  await InventoryItemsService.remove(c.req.param('id'))
  return c.json({ ok: true })
})
