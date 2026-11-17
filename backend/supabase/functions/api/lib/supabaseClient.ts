import { createClient } from 'npm:@supabase/supabase-js@2'

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically into
// every Edge Function's environment by the Supabase platform. The service
// role key bypasses Row Level Security — this is the only place in the whole
// system with direct database access; RLS denies everyone else by default.
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

export const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
})
