import { Hono } from 'npm:hono@4'
import { ProductionService } from '../services/production.service.ts'
import { CostingService } from '../services/costing.service.ts'
import type { ProductionRunInput } from '../types/domain.ts'
import type { AppEnv } from '../types/context.ts'

/**
 * Production is the only place stock is created rather than bought, and the
 * only place raw materials leave for a reason other than a sale.
 */
export const productionRoute = new Hono<AppEnv>()

productionRoute.get('/', async (c) => {
  const limit = Number(c.req.query('limit') ?? '50')
  return c.json(await ProductionService.list(Number.isFinite(limit) ? limit : 50))
})

/**
 * What a batch would cost, batch by batch. A question, not a change: it
 * writes nothing and can be asked as often as the form needs.
 */
productionRoute.post('/costing', async (c) => {
  const body = await c.req.json<{ inputs: ProductionRunInput['inputs']; outputQty: number }>()
  return c.json(await CostingService.preview(body.inputs, Number(body.outputQty)))
})

productionRoute.post('/', async (c) => {
  const body = await c.req.json<ProductionRunInput>()
  const id = await ProductionService.record(body, c.get('userId') ?? null)
  return c.json({ ok: true, id })
})
