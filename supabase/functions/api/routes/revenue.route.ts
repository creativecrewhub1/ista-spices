import { Hono } from 'npm:hono@4'
import { RevenueService } from '../services/revenue.service.ts'
import { ProfitService } from '../services/profit.service.ts'
import type { AppEnv } from '../types/context.ts'

export const revenueRoute = new Hono<AppEnv>()

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

// Profit sits under revenue because it is the same question asked one layer
// deeper: what the earnings were, less what earning them cost.

revenueRoute.get('/profit/months', async (c) => {
  return c.json(await ProfitService.months())
})

revenueRoute.get('/profit', async (c) => {
  return c.json(await ProfitService.forMonth(c.req.query('month')))
})

revenueRoute.get('/expenses', async (c) => {
  return c.json(await ProfitService.listExpenses(c.req.query('month')))
})

revenueRoute.post('/expenses', async (c) => {
  const body = await c.req.json()
  await ProfitService.addExpense(body, c.get('userId') ?? null)
  return c.json({ ok: true }, 201)
})

revenueRoute.delete('/expenses/:id', async (c) => {
  await ProfitService.removeExpense(c.req.param('id'))
  return c.json({ ok: true })
})
