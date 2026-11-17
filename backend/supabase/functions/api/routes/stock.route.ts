import { Hono } from 'npm:hono@4'
import { StockService } from '../services/stock.service.ts'
import type { StockReceiptInput } from '../types/domain.ts'

export const stockRoute = new Hono()

/** Current position for every item: quantity, average cost, value. */
stockRoute.get('/', async (c) => {
  const stock = await StockService.list()
  return c.json(stock)
})

/** Movement history, optionally for one item. */
stockRoute.get('/movements', async (c) => {
  const limitParam = Number(c.req.query('limit'))
  const movements = await StockService.movements(
    c.req.query('itemId'),
    Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined,
  )
  return c.json(movements)
})

/** Stock in. */
stockRoute.post('/receipts', async (c) => {
  const body = await c.req.json<StockReceiptInput>()
  await StockService.receive(body)
  return c.json({ ok: true })
})

stockRoute.post('/adjustments', async (c) => {
  const body = await c.req.json<{ itemId: string; qty: number; note: string }>()
  await StockService.adjust(body)
  return c.json({ ok: true })
})
