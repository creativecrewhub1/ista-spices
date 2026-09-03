import { Hono } from 'npm:hono@4'
import { InventoryItemsService } from '../services/inventoryItems.service.ts'

export const inventoryItemsRoute = new Hono()

inventoryItemsRoute.get('/', async (c) => {
  const items = await InventoryItemsService.list({ type: c.req.query('type'), search: c.req.query('q')?.trim() || undefined })
  return c.json(items)
})
