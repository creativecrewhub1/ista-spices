import * as authRepo from '../repositories/auth.repo.ts'
import { HttpError } from '../lib/httpError.ts'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const AuthService = {
  status: async () => ({ adminExists: await authRepo.adminExists() }),

  signUp: async (email: string, password: string) => {
    if (!email || !EMAIL_RE.test(email)) {
      throw new HttpError(400, 'A valid email is required')
    }
    if (!password || password.length < 8) {
      throw new HttpError(400, 'Password must be at least 8 characters')
    }

    // Single-admin rule enforced here, server-side — the frontend cannot
    // bypass this by hiding the sign-up form; it's re-checked on every call.
    if (await authRepo.adminExists()) {
      throw new HttpError(403, 'An admin account already exists. Sign in instead.')
    }

    const user = await authRepo.createAdminUser(email, password)
    return { id: user?.id, email: user?.email }
  },
}
