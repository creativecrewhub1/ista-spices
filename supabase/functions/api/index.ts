import { Hono } from 'npm:hono@4'
import { cors } from 'npm:hono/cors'
import { authRoute } from './routes/auth.route.ts'
import { productsRoute } from './routes/products.route.ts'
import { inventoryItemsRoute } from './routes/inventoryItems.route.ts'
import { stockRoute } from './routes/stock.route.ts'
import { unitsRoute } from './routes/units.route.ts'
import { itemCategoriesRoute } from './routes/itemCategories.route.ts'
import { itemsRoute } from './routes/items.route.ts'
import { customersRoute } from './routes/customers.route.ts'
import { ordersRoute } from './routes/orders.route.ts'
import { revenueRoute } from './routes/revenue.route.ts'
import { dashboardRoute } from './routes/dashboard.route.ts'
import { storefrontRoute } from './routes/storefront.route.ts'
import { requireAuth } from './middleware/requireAuth.ts'
import { requireAdmin } from './middleware/requireAdmin.ts'
import { HttpError } from './lib/httpError.ts'

// The gateway strips /functions/v1 but keeps the function name, so this
// function receives requests at /api/*.
const app = new Hono().basePath('/api')

app.use(
  '*',
  cors({
    origin: '*',
    allowHeaders: ['authorization', 'apikey', 'content-type'],
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)

// Reachable with no session at all: pre-login admin bootstrap checks, public
// storefront browsing (a customer can look at products before signing in —
// login is only required to check out), and pure reference data (unit
// conversions) that customer-facing pages need to render pack labels for
// anyone, not just admins.
const PUBLIC_PATHS = new Set([
  '/api/auth/status',
  '/api/auth/signup',
  '/api/storefront/products',
  '/api/units',
])

// Everything else needs a real signed-in user — the gateway's verify_jwt
// only checks "is this some valid Supabase JWT", which the anon key itself
// satisfies. This is what actually gates access behind login, and attaches
// the caller's role for the admin check below.
app.use('*', async (c, next) => {
  if (PUBLIC_PATHS.has(c.req.path)) return next()
  return requireAuth(c, next)
})

// Admin-only surface: everything that manages the business rather than a
// customer's own cart/orders. Google sign-in can never reach these, since it
// only ever produces role='customer' (see the on_auth_user_created trigger).
const ADMIN_PREFIXES = [
  '/api/products',
  '/api/inventory-items',
  '/api/stock',
  '/api/item-categories',
  '/api/items',
  '/api/customers',
  '/api/orders',
  '/api/revenue',
  '/api/dashboard',
]

app.use('*', async (c, next) => {
  if (ADMIN_PREFIXES.some((prefix) => c.req.path.startsWith(prefix))) {
    return requireAdmin(c, next)
  }
  return next()
})

app.route('/auth', authRoute)
app.route('/products', productsRoute)
app.route('/inventory-items', inventoryItemsRoute)
app.route('/stock', stockRoute)
app.route('/units', unitsRoute)
app.route('/item-categories', itemCategoriesRoute)
app.route('/items', itemsRoute)
app.route('/customers', customersRoute)
app.route('/orders', ordersRoute)
app.route('/revenue', revenueRoute)
app.route('/dashboard', dashboardRoute)
app.route('/storefront', storefrontRoute)

app.onError((err, c) => {
  // An error response is built outside the middleware chain, so the CORS
  // header the cors() middleware would have added is not applied here. Without
  // it the browser reports a network failure and the caller never sees why.
  c.header('Access-Control-Allow-Origin', '*')
  if (err instanceof HttpError) {
    return c.json({ error: err.message }, err.status as 400 | 401 | 403 | 404 | 409)
  }
  console.error(err)
  return c.json({ error: 'Internal server error' }, 500)
})

Deno.serve(app.fetch)
