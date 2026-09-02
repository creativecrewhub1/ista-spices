import { Hono } from 'npm:hono@4'
import { ProductsService } from '../services/products.service.ts'
import type { Product } from '../types/domain.ts'

export const productsRoute = new Hono()

productsRoute.get('/', async (c) => {
  const products = await ProductsService.list(c.req.query('q'))
  return c.json(products)
})

productsRoute.post('/', async (c) => {
  const body = await c.req.json<Product>()
  await ProductsService.save(body)
  return c.json({ ok: true })
})

productsRoute.delete('/:id', async (c) => {
  await ProductsService.remove(c.req.param('id'))
  return c.json({ ok: true })
})
