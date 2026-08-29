import type { Context, Next } from 'npm:hono@4'
import { authClient } from '../lib/authClient.ts'
import { HttpError } from '../lib/httpError.ts'

/**
 * Verifies the caller holds a real, current Supabase user session — not just
 * the public anon key (verify_jwt at the gateway only checks "is this some
 * valid Supabase JWT", which the anon key itself satisfies). This is what
 * actually gates access to business data behind login.
 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) throw new HttpError(401, 'Missing Authorization token')

  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) throw new HttpError(401, 'Invalid or expired session')

  c.set('userId', data.user.id)
  c.set('userEmail', data.user.email ?? '')
  await next()
}
