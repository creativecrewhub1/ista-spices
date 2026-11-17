import { createClient } from '@supabase/supabase-js'

// Used ONLY for authentication (sign in/up/out, session management). All
// business data access goes through apiClient.ts → the "api" Edge Function —
// this client never calls .from() on a table.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !ANON_KEY) {
  throw new Error(
    'Missing Supabase env vars — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env',
  )
}

export const supabaseAuth = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
})
