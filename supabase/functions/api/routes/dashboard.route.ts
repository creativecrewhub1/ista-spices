import { Hono } from 'npm:hono@4'
import { DashboardService } from '../services/dashboard.service.ts'

export const dashboardRoute = new Hono()

dashboardRoute.get('/today', async (c) => {
  const summary = await DashboardService.today()
  return c.json(summary)
})

dashboardRoute.get('/needs-attention', async (c) => {
  const attention = await DashboardService.needsAttention()
  return c.json(attention)
})
