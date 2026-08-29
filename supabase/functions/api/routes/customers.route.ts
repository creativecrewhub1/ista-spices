import { Hono } from 'npm:hono@4'
import { CustomersService } from '../services/customers.service.ts'

export const customersRoute = new Hono()

customersRoute.get('/', async (c) => {
  const customers = await CustomersService.list()
  return c.json(customers)
})
