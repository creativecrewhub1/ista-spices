import type { Context, Next } from 'npm:hono@4'
import { HttpError } from '../lib/httpError.ts'

/** Must run after requireAuth, which sets userRole on the context. */
export async function requireAdmin(c: Context, next: Next) {
  if (c.get('userRole') !== 'admin') {
    throw new HttpError(403, 'Admin access required')
  }
  await next()
}
