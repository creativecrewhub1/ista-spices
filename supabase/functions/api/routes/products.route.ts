import { Hono } from 'npm:hono@4'
import { ProductsService } from '../services/products.service.ts'

export const productsRoute = new Hono()

productsRoute.get('/', async (c) => {
  const products = await ProductsService.list(c.req.query('q'))
  return c.json(products)
})
