import { Hono } from 'npm:hono@4'
import { CustomersService } from '../services/customers.service.ts'

export const customersRoute = new Hono()

customersRoute.get('/', async (c) => {
  const customers = await CustomersService.list({
    search: c.req.query('q'),
    segment: c.req.query('segment'),
    activity: c.req.query('activity'),
  })
  return c.json(customers)
})

// Declared before '/:id/orders' would ever shadow it.
customersRoute.get('/counts', async (c) => {
  const counts = await CustomersService.counts()
  return c.json(counts)
})

customersRoute.get('/:id/orders', async (c) => {
  const orders = await CustomersService.orders(c.req.param('id'))
  return c.json(orders)
})
