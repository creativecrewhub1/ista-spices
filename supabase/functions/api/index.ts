import { Hono } from 'npm:hono@4'
import { cors } from 'npm:hono/cors'
import { authRoute } from './routes/auth.route.ts'
import { productsRoute } from './routes/products.route.ts'
import { customersRoute } from './routes/customers.route.ts'
import { ordersRoute } from './routes/orders.route.ts'
import { revenueRoute } from './routes/revenue.route.ts'
import { dashboardRoute } from './routes/dashboard.route.ts'
import { requireAuth } from './middleware/requireAuth.ts'
import { HttpError } from './lib/httpError.ts'

// The gateway strips /functions/v1 but keeps the function name, so this
// function receives requests at /api/* — every route below nests under that.
const app = new Hono().basePath('/api')

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['authorization', 'apikey', 'content-type'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

// Everything except /auth/* requires a real signed-in user session, not just
// the public anon key (which alone satisfies the gateway's verify_jwt check).
app.use('*', async (c, next) => {
  if (c.req.path.startsWith('/api/auth/')) return next()
  return requireAuth(c, next)
})

app.route('/auth', authRoute)
app.route('/products', productsRoute)
app.route('/customers', customersRoute)
app.route('/orders', ordersRoute)
app.route('/revenue', revenueRoute)
app.route('/dashboard', dashboardRoute)

app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json({ error: err.message }, err.status as 400 | 401 | 403 | 404 | 409)
  }
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

Deno.serve(app.fetch)
