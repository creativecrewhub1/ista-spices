// The only place in the frontend that knows how to reach the backend.
// Every read and write goes through the "api" Supabase Edge Function —
// there is no direct database access from the browser.
import { supabaseAuth } from './supabaseAuthClient'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error(
    'Missing Supabase env vars — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  )
}

const API_BASE = `${SUPABASE_URL}/functions/v1/api`

async function authHeader(): Promise<string> {
  const {
    data: { session },
  } = await supabaseAuth.auth.getSession()
  // Falls back to the anon key for pre-login calls (auth status/signup) —
  // every other route requires a real session and rejects the anon key alone.
  return session?.access_token ?? ANON_KEY
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON_KEY,
      Authorization: `Bearer ${await authHeader()}`,
      ...init.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed with status ${res.status}`)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
