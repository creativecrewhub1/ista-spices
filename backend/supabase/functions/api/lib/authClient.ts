import { createClient } from 'npm:@supabase/supabase-js@2'

// A separate client using the anon key (not service role) — used only to
// validate a caller's JWT via auth.getUser(). This is how we tell "a real
// signed-in user" apart from "someone who just has the public anon key."
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

export const authClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
})
