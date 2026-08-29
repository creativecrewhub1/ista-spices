import { Hono } from 'npm:hono@4'
import { AuthService } from '../services/auth.service.ts'

export const authRoute = new Hono()

// Reachable before login — no requireAuth on this router.
authRoute.get('/status', async (c) => {
  const status = await AuthService.status()
  return c.json(status)
})

authRoute.post('/signup', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>()
  const result = await AuthService.signUp(body.email ?? '', body.password ?? '')
  return c.json(result)
})
