import { Hono } from 'npm:hono@4'
import { OrdersService } from '../services/orders.service.ts'
import { HttpError } from '../lib/httpError.ts'

export const ordersRoute = new Hono()

ordersRoute.get('/', async (c) => {
  const orders = await OrdersService.list({
    status: c.req.query('status'),
    search: c.req.query('q'),
  })
  return c.json(orders)
})

ordersRoute.get('/counts', async (c) => {
  const counts = await OrdersService.statusCounts()
  return c.json(counts)
})

ordersRoute.get('/:id', async (c) => {
  const order = await OrdersService.get(c.req.param('id'))
  return c.json(order)
})

/** Recorded transition history, so the timeline shows when each step happened. */
ordersRoute.get('/:id/events', async (c) => {
  const events = await OrdersService.statusEvents(c.req.param('id'))
  return c.json(events)
})

ordersRoute.patch('/:id/status', async (c) => {
  const body = await c.req.json<{ status?: string }>()
  if (!body.status) throw new HttpError(400, 'status is required')
  await OrdersService.updateStatus(c.req.param('id'), body.status)
  return c.json({ ok: true })
})
