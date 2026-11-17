import type { Context, Next } from 'npm:hono@4'
import { authClient } from '../lib/authClient.ts'
import { HttpError } from '../lib/httpError.ts'
import * as authRepo from '../repositories/auth.repo.ts'

/**
 * Verifies the caller holds a real, current Supabase user session — not just
 * the public anon key (verify_jwt at the gateway only checks "is this some
 * valid Supabase JWT", which the anon key itself satisfies) — and attaches
 * their role from `profiles` so requireAdmin and route handlers can act on
 * it. Any signed-in user (password or Google) passes this; role decides what
 * they can reach from here.
 */
export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('authorization') ?? ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) throw new HttpError(401, 'Missing Authorization token')

  const { data, error } = await authClient.auth.getUser(token)
  if (error || !data.user) throw new HttpError(401, 'Invalid or expired session')

  const role = await authRepo.getRole(data.user.id)
  if (!role) throw new HttpError(403, 'No profile found for this account')

  c.set('userId', data.user.id)
  c.set('userEmail', data.user.email ?? '')
  c.set('userRole', role)
  await next()
}
