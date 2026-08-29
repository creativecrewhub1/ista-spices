import { Hono } from 'npm:hono@4'
import { RevenueService } from '../services/revenue.service.ts'

export const revenueRoute = new Hono()

revenueRoute.get('/summary', async (c) => {
  const summary = await RevenueService.summary()
  return c.json(summary)
})

revenueRoute.get('/by-day', async (c) => {
  const days = Number(c.req.query('days') ?? '7')
  const bucket = c.req.query('bucket')
  const points = await RevenueService.byDay(days, bucket)
  return c.json(points)
})

revenueRoute.get('/by-product', async (c) => {
  const rows = await RevenueService.byProduct()
  return c.json(rows)
})

revenueRoute.get('/by-product/:id/trend', async (c) => {
  const days = Number(c.req.query('days') ?? '7')
  const points = await RevenueService.productTrend(c.req.param('id'), days)
  return c.json(points)
})
